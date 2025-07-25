import { verifyIntegrationAppToken } from "@/lib/integration-app-auth";
import { NextRequest, NextResponse } from "next/server";
import { DocumentModel } from "@/models/document";
import connectDB from "@/lib/mongodb";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { ExternalSyncStatus } from "@/types/download";

const linkIdWebhookSchema = z.object({
  userId: z.string(),
  id: z.string().min(1), // The internal ID of the document
  externalId: z.string().min(1), // The ID of the document on the external platform
});

/**
 * This webhook is triggered when a document is created on external apps
 * and we need to link our internal ID with the external ID
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log("Link ID Webhook Body:", body);

  const verificationResult = await verifyIntegrationAppToken(request);

  if (!verificationResult) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const payload = linkIdWebhookSchema.safeParse(body);

  if (!payload.success) {
    console.error("Invalid link ID webhook payload:", payload.error);
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  const { id, externalId, userId } = payload.data;

  if (!userId) {
    console.error("User ID not found for connection:", userId);
    return NextResponse.json(
      { error: "User ID not found for connection" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Find the document with our internal ID and update it with the external ID
    const updatedDoc = await DocumentModel.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId,
      },
      {
        $set: {
          id: externalId, // Update the ID to the external ID
          externalSyncStatus: ExternalSyncStatus.SUCCESS,
        },
      },
      {
        new: true, // Return the updated document
      }
    );

    if (!updatedDoc) {
      console.error(
        `Document with internal id ${id} not found for user ${userId}`
      );
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    console.log(
      `Successfully linked document: internal ID ${id} -> external ID ${externalId}`
    );

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error processing link ID webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
