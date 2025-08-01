import { inngest } from "@/inngest/inngest";
import { syncRecordsEvent } from "@/inngest/functions/sync-records";

export async function triggerSyncRecords(props: {
  userId: string;
  token: string;
  integrationKey: string;
  actionId: string;
  syncId: string;
}) {
  return await inngest.send({
    name: syncRecordsEvent,
    data: props,
  });
}
