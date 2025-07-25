import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { downloadFile } from "./download-utils";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;
const REGION = process.env.AWS_REGION!;

/**
 * Generates a public URL for an S3 object
 * @param key - The S3 key of the object
 * @returns The public URL for the S3 object
 */
export function generateS3PublicURL(key: string): string {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Generates a standardized S3 key for file uploads
 * @param userId - The user ID
 * @param filename - The original filename
 * @param prefix - Optional prefix for organization (e.g., 'documents', 'uploads')
 * @returns A standardized S3 key
 */
export function generateS3Key(
  userId: string,
  filename: string,
  prefix: string = "documents"
): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = filename.split(".").pop() || "";
  const baseName = filename.replace(/\.[^/.]+$/, ""); // Remove extension

  // Sanitize filename for S3 key
  const sanitizedName = baseName
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 50); // Limit length

  return `${prefix}/${userId}/${timestamp}_${randomId}_${sanitizedName}.${extension}`;
}

/**
 * Uploads a file to S3 with proper metadata
 * @param key - The S3 key where the file will be stored
 * @param buffer - The file buffer to upload
 * @param contentType - The MIME type of the file
 * @param metadata - Optional metadata to attach to the object
 * @returns Promise<string> - The S3 key where the file was uploaded
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: metadata,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return key;
}

/**
 * Downloads a file from a given URI and uploads it to S3
 * @param downloadURI - The URI to download the file from
 * @param userId - The user ID for key generation
 * @param filename - The original filename
 * @param prefix - Optional prefix for organization
 * @returns Promise<{key: string, publicURL: string, buffer: Buffer}> - The S3 key, public URL, and buffer
 */
export async function processAndUploadFileToS3(
  downloadURI: string,
  userId: string,
  filename: string,
  prefix: string = "documents"
) {
  const { buffer, contentType } = await downloadFile(downloadURI);

  const key = generateS3Key(userId, filename, prefix);

  await uploadToS3(key, buffer, contentType);

  const publicURL = generateS3PublicURL(key);

  return {
    key,
    publicURL,
    buffer,
  };
}

/**
 * Gets a readable stream for an S3 object
 * @param key - The S3 key of the object
 * @returns Promise<GetObjectCommandOutput> - The S3 object stream
 */
export async function getS3ObjectStream(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await s3Client.send(command);
}

/**
 * Deletes a file from S3
 * @param key - The S3 key of the file to delete
 */
export async function deleteFileFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Validates that all required AWS credentials are present
 */
export const hasAWSCredentials =
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY &&
  !!process.env.AWS_BUCKET_NAME &&
  !!process.env.AWS_REGION;
