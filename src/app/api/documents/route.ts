import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { DocumentModel, Document } from "@/models/document";
import { getAuthFromRequest } from "@/lib/server-auth";
import { uploadToS3, generateS3Key, generateS3PublicURL } from "@/lib/s3-utils";
import { ExternalSyncStatus } from "@/types/download";
import { onFileCreated } from "@/lib/app-events";

async function handleDocumentCreation(
  formData: FormData,
  userId: string
): Promise<Document> {
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const parentId = formData.get("parentId") as string;
  const appKey = formData.get("appKey") as string;
  const canHaveChildren = formData.get("canHaveChildren") === "true";
  const canDownload = formData.get("canDownload") === "true";

  if (!title) {
    throw new Error("Title is required");
  }

  let url: string | undefined;
  let storageKey: string | undefined;

  // Handle file upload if file is provided
  if (file) {
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate standardized S3 key
    storageKey = generateS3Key(userId, file.name, "documents");

    // Upload to S3 with metadata
    await uploadToS3(storageKey, buffer, file.type, {
      originalName: file.name,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    });

    // Generate public URL
    url = generateS3PublicURL(storageKey);
  }

  const newDocument = new DocumentModel({
    title,
    canHaveChildren,
    canDownload,
    parentId: parentId || null,
    userId,
    appKey: appKey || null,
    source: "internal",
    url,
    storageKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    externalSyncStatus: ExternalSyncStatus.PENDING,
  });

  await newDocument.save();

  try {
    await onFileCreated({
      id: newDocument._id,
      title: newDocument.title,
      url: newDocument.url!,
      userId,
      folderId: newDocument.parentId,
      type: newDocument.canHaveChildren ? "folder" : "file",
    });
  } catch (error) {
    console.error("Failed to save document on external app:", error);
    newDocument.externalSyncStatus = ExternalSyncStatus.FAILED;
    newDocument.externalSyncError =
      error instanceof Error ? error.message : "Unknown error";
    await newDocument.save();
  }

  return newDocument;
}

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request);
  const userId = auth.customerId;
  const { searchParams } = new URL(request.url);
  const integrationKey = searchParams.get("integrationKey");

  try {
    await connectDB();

    const query: { userId: string; appKey?: string } = { userId };

    if (integrationKey) {
      query.appKey = integrationKey;
    }

    const documents = await DocumentModel.find(query);

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthFromRequest(request);

  if (!auth?.customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const formData = await request.formData();
    const result = await handleDocumentCreation(formData, auth.customerId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create document";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
