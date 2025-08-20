import { verifyIntegrationAppToken } from "@/lib/integration-app-auth";
import { Record } from "@/models/record";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { z } from "zod";
import { Sync } from "@/models/sync";
import { createSyncActivity } from "@/lib/sync-activity-utils";

const webhookSchema = z.object({
  externalRecordId: z.string(),
  data: z.object({
    fields: z.object({}).catchall(z.any()),
  }),
  instanceKey: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  const tokenVerificationResult = await verifyIntegrationAppToken(request);

  if (!tokenVerificationResult) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const payload = webhookSchema.safeParse(body);

  if (!payload.success) {
    console.error("Invalid webhook payload:", payload.error);
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  const userId = tokenVerificationResult.sub;

  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 401 });
  }

  try {
    await connectDB();

    const { externalRecordId, data, instanceKey } = payload.data;

    // Get associated sync
    const sync = await Sync.findOne({
      instanceKey,
      userId,
    });

    if (!sync) {
      console.log(
        `Sync with instanceKey ${instanceKey} not found for user ${userId}`
      );
      return NextResponse.json({ error: "Sync not found" }, { status: 404 });
    }

    const existingRecord = await Record.findOne({
      id: externalRecordId,
      userId,
      syncId: sync._id,
    });

    if (!existingRecord) {
      console.log(`Record with id ${externalRecordId} not found`);
      return NextResponse.json(
        { message: "Document not found" },
        { status: 200 }
      );
    }

    await existingRecord.updateOne({
      $set: {
        ...data.fields,
      },
    });

    // Calculate differences between old and new data
    const oldData = existingRecord.data;
    const newData = data.fields;
    const differences: Record<string, { old: unknown; new: unknown }> = {};

    // Find changed fields
    for (const [key, newValue] of Object.entries(newData)) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newValue)) {
        differences[key] = {
          old: oldData[key],
          new: newValue,
        };
      }
    }

    // Track the record update activity
    await createSyncActivity({
      syncId: sync._id.toString(),
      userId,
      type: "event_record_updated",
      recordId: existingRecord._id.toString(),
      metadata: {
        recordId: externalRecordId,
        fieldsCount: Object.keys(data.fields).length,
        differences,
      },
    });

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Error in on-update webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
