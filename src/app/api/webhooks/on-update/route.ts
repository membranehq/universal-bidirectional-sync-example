import { verifyIntegrationAppToken } from "@/lib/integration-app-auth";
import { Record } from "@/models/record";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { z } from "zod";
import { Sync } from "@/models/sync";

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

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Error in on-update webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
