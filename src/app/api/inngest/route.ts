import { serve } from "inngest/next";
import { inngest } from "@/inngest/inngest";
import { syncRecordsFunction } from "@/inngest/functions/pull-records";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncRecordsFunction],
});
