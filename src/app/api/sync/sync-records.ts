import { IntegrationAppClient } from "@integration-app/sdk";
import { Record } from "@/models/record";
import connectDB from "@/lib/mongodb";
import { Sync } from "@/models/sync";

export async function syncRecords(props: {
  userId: string;
  token: string;
  integrationKey: string;
  actionId: string;
  syncId: string;
}): Promise<{ success: boolean; totalDocumentsSynced: number }> {
  const { userId, token, integrationKey, actionId, syncId } = props;

  let totalDocumentsSynced = 0;

  const MAX_DOCUMENTS = 1000; // Maximum number of documents to sync

  await connectDB();

  const integrationApp = new IntegrationAppClient({ token });
  let cursor: string | undefined;

  try {
    // Sync all documents in batches
    while (true) {
      console.info("Fetching records batch");

      const result = await integrationApp
        .connection(integrationKey)
        .action(actionId)
        .run({ cursor });

      const records = (result.output?.records ?? []) as {
        fields: Record<string, unknown>;
      }[];

      // Check if adding these documents would exceed our limit
      if (totalDocumentsSynced + records.length > MAX_DOCUMENTS) {
        const remainingSlots = MAX_DOCUMENTS - totalDocumentsSynced;
        records.splice(remainingSlots);
      }

      if (records.length) {
        await Record.bulkWrite(
          records.map((doc) => ({
            insertOne: {
              document: {
                data: doc.fields,
                id: doc.fields.id,
                userId,
                syncId,
              },
            },
          }))
        );

        totalDocumentsSynced += records.length;
      }

      // Break if we've reached the maximum number of documents
      if (totalDocumentsSynced >= MAX_DOCUMENTS) {
        break;
      }

      // Only continue if there's more data to fetch
      cursor = result.output.cursor;
      if (!cursor) break;
    }

    await Sync.updateOne(
      { _id: syncId },
      {
        status: "completed",
        error: "",
        $inc: { syncCount: 1 },
      }
    );

    return { success: true, totalDocumentsSynced };
  } catch (error) {
    console.error("Error in syncRecords:", error);
    await Sync.findByIdAndUpdate(syncId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return { success: false, totalDocumentsSynced };
  }
}
