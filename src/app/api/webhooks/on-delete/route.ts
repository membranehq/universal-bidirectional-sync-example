import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Record } from "@/models/record";
import connectDB from "@/lib/mongodb";
import { Sync } from "@/models/sync";
import { verifyIntegrationAppToken } from "@/lib/integration-app-auth";
import { createSyncActivity } from "@/lib/sync-activity-utils";

const webhookSchema = z.object({
  externalRecordId: z.string(),
  instanceKey: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = webhookSchema.safeParse(body);

  const tokenVerificationResult = await verifyIntegrationAppToken(request);

  if (!tokenVerificationResult) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!result.success) {
    console.error("Invalid webhook payload:", result.error);
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const payload = result.data;

    const userId = tokenVerificationResult.sub;

    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 401 });
    }

    const sync = await Sync.findOne({
      instanceKey: payload.instanceKey,
      userId,
    });

    if (!sync) {
      return NextResponse.json({ error: "Sync not found" }, { status: 404 });
    }

    // Find the record before deleting to get its ID for activity tracking
    const recordToDelete = await Record.findOne({
      id: payload.externalRecordId,
      syncId: sync._id,
    });

    await Record.deleteOne({ id: payload.externalRecordId, syncId: sync._id });

    // Track the record deletion activity
    if (recordToDelete) {
      await createSyncActivity({
        syncId: sync._id.toString(),
        userId,
        type: "event_record_deleted",
        recordId: recordToDelete._id.toString(),
        metadata: {
          recordId: payload.externalRecordId,
          recordExisted: true,
        },
      });
    }

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Error in on-delete webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
