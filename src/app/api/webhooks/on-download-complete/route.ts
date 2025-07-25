import { z } from "zod";
import connectDB from "@/lib/mongodb";

import { DocumentModel } from "@/models/document";
import { NextResponse } from "next/server";
import { DownloadState } from "@/types/download";
import { deleteFileFromS3, processAndUploadFileToS3 } from "@/lib/s3-utils";

const onDownloadCompleteWebhookPayloadSchema = z.object({
  downloadURI: z
    .union([
      z.string().url().min(1),
      z
        .string()
        .length(0)
        .transform(() => undefined),
    ])
    .optional(),
  documentId: z.string(),
  userId: z.string(),
});

/**
 * This endpoint is called when a download flow for a document is complete
 *
 * - We want to update the document with new content if provided
 * - When new resourceURI is provided, we want to download the file into our own storage
 *   and update the document with the new downloadURI
 */

export async function POST(request: Request) {
  try {
    const rawPayload = await request.json();

    const validationResult =
      onDownloadCompleteWebhookPayloadSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      console.error("Invalid webhook payload:", validationResult.error);
      return NextResponse.json(
        {
          error: "Invalid webhook payload",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;
    const { downloadURI, documentId } = payload;

    await connectDB();

    const document = await DocumentModel.findOne({
      userId: payload.userId,
      id: documentId,
    });

    if (!document) {
      console.error(`Document with id ${documentId} not found`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If no downloadURI is provided, just mark as done
    if (!downloadURI) {
      await DocumentModel.findOneAndUpdate(
        { userId: payload.userId, id: documentId },
        {
          $set: {
            downloadState: DownloadState.DONE,
          },
        }
      );
      return NextResponse.json({ success: true }, { status: 200 });
    }

    try {
      // Mark document as downloading
      await DocumentModel.updateOne(
        { userId: payload.userId, id: documentId },
        { $set: { downloadState: DownloadState.DOWNLOADING_FROM_URL } }
      );

      // Download and upload file to S3 using standardized approach
      const { publicURL: url } = await processAndUploadFileToS3(
        downloadURI,
        payload.userId,
        document.title || `document_${documentId}`
      );

      // Clean up old S3 file if needed
      if (document.url) {
        await deleteFileFromS3(document.url);
        console.info(`Deleted old file from S3: ${document.url}`);
      }

      // Update document with new storage key and public URL, and mark as done
      const updatedDoc = await DocumentModel.findOneAndUpdate(
        { userId: payload.userId, id: documentId },
        {
          $set: {
            downloadState: DownloadState.DONE,
            url: url,
          },
        },
        { new: true }
      ).lean();

      if (!updatedDoc) {
        throw new Error("Failed to update document");
      }

      console.info(
        `Successfully downloaded and stored file: ${document.title}`
      );
    } catch (error) {
      console.error("Error in downloadAndExtractTextFromFile:", error);

      // Update document with error state
      await DocumentModel.updateOne(
        { userId: payload.userId, id: documentId },
        {
          $set: {
            downloadState: DownloadState.FAILED,
            downloadError:
              error instanceof Error ? error.message : "Error downloading file",
          },
        }
      );

      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to process webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
