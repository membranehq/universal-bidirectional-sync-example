import { inngest } from "@/inngest/inngest";
import { IntegrationAppClient } from "@integration-app/sdk";
import { Record } from "@/models/record";
import { Sync } from "@/models/sync";
import { createSyncActivity } from "@/lib/sync-activity-utils";
import { withTimeout } from "@/lib/timeout";
import connectDB from "@/lib/mongodb";

// Define the event type for sync records
export const syncRecordsEvent = "sync/records" as const;

// Helper function to handle sync failure
const handleSyncFailure = async ({
  eventData,
  errorMessage,
}: {
  eventData: Record<string, unknown>;
  errorMessage: string;
}) => {
  const syncId = eventData.syncId as string;
  const userId = eventData.userId as string;

  // Update sync status to failed
  await Sync.findByIdAndUpdate(syncId, {
    status: "failed",
    error: errorMessage,
  });

  // Track sync failed activity
  await createSyncActivity({
    syncId,
    userId,
    type: "sync_completed",
    metadata: {
      error: errorMessage,
      failed: true,
    },
  });
};

export const syncRecordsFunction = inngest.createFunction(
  {
    id: "sync-records",
    retries: 3,
    onFailure: async (props) => {
      const event = props.event.data;
      const errorMessage = event.error.message;
      const eventData = event.event.data;

      await handleSyncFailure({ eventData, errorMessage });
    },
  },
  { event: syncRecordsEvent },
  async ({ event, step, logger }) => {
    const { userId, token, integrationKey, actionKey, syncId } = event.data;
    let totalDocumentsSynced = 0;

    const FETCH_PAGE_TIMEOUT = 60000; // 60 seconds timeout
    const MAX_DOCUMENTS = 1000; // Maximum number of documents to sync

    await connectDB();

    // Track sync syncing activity
    await step.run("track-sync-start", async () => {
    await Sync.updateOne(
        { _id: syncId },
        { $set: { error: "" } }
      );

      await createSyncActivity({
        syncId,
        userId,
        type: "sync_syncing",
        metadata: {
          maxDocuments: MAX_DOCUMENTS,
        },
      });

   
    });

    const integrationApp = new IntegrationAppClient({ token });
    let cursor: string | undefined;

    // Sync all documents in batches
    while (true) {
      logger.info("Fetching records batch");

      // Fetch and process records in a single step to avoid large step output
      const batchResult = await step.run(
        "fetch-and-save-records-batch",
        async () => {
          const fetchPromise = integrationApp
            .connection(integrationKey)
            .action(actionKey)
            .run({ cursor });

          const result = await withTimeout(
            fetchPromise,
            FETCH_PAGE_TIMEOUT,
            `Fetching page timed out after ${
              FETCH_PAGE_TIMEOUT / 1000
            } seconds, please try again`
          );

          const records = (result.output?.records ?? []) as {
            fields: Record<string, unknown>;
            name: string;
            createdAt: Date;
            updatedAt: Date;
          }[];

          // Check if adding these documents would exceed our limit
          const remainingSlots = MAX_DOCUMENTS - totalDocumentsSynced;
          const recordsToProcess = records.slice(0, remainingSlots);

          if (recordsToProcess.length) {
            await Record.bulkWrite(
              recordsToProcess.map((record) => ({
                insertOne: {
                  document: {
                    userId,
                    syncId,
                    data: record.fields,
                    externalId: record.fields.id,
                    name: record.name,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                  },
                },
              }))
            );
          }

          // Return only metadata, not the large records data
          return {
            recordsProcessed: recordsToProcess.length,
            hasMore: !!result.output?.cursor,
            nextCursor: result.output?.cursor,
            totalRemaining: Math.max(0, records.length - remainingSlots),
          };
        }
      );

      totalDocumentsSynced += batchResult.recordsProcessed;

      // Break if we've reached the maximum number of documents
      if (totalDocumentsSynced >= MAX_DOCUMENTS) {
        break;
      }

      // Only continue if there's more data to fetch
      cursor = batchResult.nextCursor;
      if (!cursor) break;
    }

    // Update final sync status
    await step.run("complete-sync", async () => {
      await Sync.findByIdAndUpdate(
        syncId,
        {
          status: "completed",
          error: "",
          $inc: { syncCount: 1 },
          isTruncated: totalDocumentsSynced >= MAX_DOCUMENTS,
        },
        { new: true }
      );
    });

    // Track sync completed activity
    await step.run("track-sync-completed", async () => {
      await createSyncActivity({
        syncId,
        userId,
        type: "sync_completed",
        metadata: {
          totalDocumentsSynced,
          maxDocuments: MAX_DOCUMENTS,
        },
      });
    });

    return { success: true, totalDocumentsSynced };
  }
);
