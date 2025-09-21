import { inngest } from "@/inngest/inngest";
import { IntegrationAppClient } from "@membranehq/sdk";
import { Record } from "@/models/record";
import { Sync } from "@/models/sync";
import { SyncActivity } from "@/models/sync-activity";
import { withTimeout } from "@/lib/timeout";
import connectDB from "@/lib/mongodb";
import { SyncStatusObject } from "@/models/types";
import { MAX_RECORDS_COUNT } from "@/lib/sync-constants";

export const pullRecordsEvent = "pull/records" as const;

const handlePullFailure = async ({
  eventData,
  errorMessage,
}: {
  eventData: Record<string, unknown>;
  errorMessage: string;
}) => {
  const syncId = eventData.syncId as string;
  const userId = eventData.userId as string;

  await Sync.findByIdAndUpdate(syncId, {
    status: SyncStatusObject.FAILED,
    error: errorMessage,
  });

  try {
    await SyncActivity.create({
      syncId,
      userId,
      type: "sync_pull_failed",
      metadata: {
        error: errorMessage,
        failed: true,
      },
    });
  } catch (error) {
    console.error("Failed to create sync activity:", error);
    // Don't throw error to avoid breaking the main flow
  }
};

export const syncRecordsFunction = inngest.createFunction(
  {
    id: "sync-records",
    retries: 3,
    onFailure: async (props) => {
      const event = props.event.data;
      const errorMessage = event.error.message;
      const eventData = event.event.data;

      await handlePullFailure({ eventData, errorMessage });
    },
  },
  { event: pullRecordsEvent },
  async ({ event, step, logger }) => {
    const { userId, token, integrationKey, actionKey, syncId } = event.data;
    let totalDocumentsSynced = 0;

    const FETCH_PAGE_TIMEOUT = 60000;

    await connectDB();

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
          const remainingSlots = MAX_RECORDS_COUNT - totalDocumentsSynced;
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
                    syncStatus: SyncStatusObject.COMPLETED,
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
      if (totalDocumentsSynced >= MAX_RECORDS_COUNT) {
        break;
      }

      // Only continue if there's more data to fetch
      cursor = batchResult.nextCursor;
      if (!cursor) break;
    }

    await step.run("complete-sync", async () => {
      await Sync.findByIdAndUpdate(
        syncId,
        {
          status: SyncStatusObject.COMPLETED,
          error: "",
          $inc: { syncCount: 1 },
          isTruncated: totalDocumentsSynced >= MAX_RECORDS_COUNT,
        },
        { new: true }
      );
    });

    return { success: true, totalDocumentsSynced };
  }
);
