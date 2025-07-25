import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Record } from "@/models/record";
import connectDB from "@/lib/mongodb";
import { Sync } from "@/models/sync";
import { verifyIntegrationAppToken } from "@/lib/integration-app-auth";

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

    const sync = await Sync.findOne({
      instanceKey: payload.instanceKey,
      userId: tokenVerificationResult.sub,
    });

    if (!sync) {
      return NextResponse.json({ error: "Sync not found" }, { status: 404 });
    }

    await Record.deleteOne({ id: payload.externalRecordId, syncId: sync._id });

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Error in on-delete webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
