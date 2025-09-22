import { inngest } from "@/inngest/inngest";
import { pullRecordsEvent } from "@/inngest/functions/pull-records";

export async function triggerPullRecords(props: {
  userId: string;
  token: string;
  integrationKey: string;
  actionKey: string;
  syncId: string;
  instanceKey: string;
}) {
  return await inngest.send({
    name: pullRecordsEvent,
    data: props,
  });
}
