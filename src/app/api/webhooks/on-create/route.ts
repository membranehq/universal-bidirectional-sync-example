import { verifyIntegrationAppToken } from "@/lib/integration-app-auth";
import { Record } from "@/models/record";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { z } from "zod";
import { Sync } from "@/models/sync";
import { SyncActivity } from "@/models/sync-activity";
import { SyncStatusObject } from "@/models/types";

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
      return NextResponse.json({ error: "Sync not found" }, { status: 404 });
    }

    const existingRecord = await Record.findOne({
      id: externalRecordId,
      syncId: sync._id,
      userId,
    });

    if (!existingRecord) {
      const newRecord = await Record.create({
        id: externalRecordId,
        userId,
        data: data.fields,
        syncId: sync._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: SyncStatusObject.COMPLETED,
      });

      // Track the record creation activity
      try {
        await SyncActivity.create({
          syncId: sync._id.toString(),
          userId,
          type: "event_record_created",
          recordId: newRecord._id.toString(),
          metadata: {
            recordId: externalRecordId,
            fieldsCount: Object.keys(data.fields).length,
          },
        });
      } catch (error) {
        console.error("Failed to create sync activity:", error);
        // Don't throw error to avoid breaking the main flow
      }
    } else {
      console.log(
        `Document with id ${payload.data.externalRecordId} already exists`
      );
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
