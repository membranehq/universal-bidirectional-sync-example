import { DocumentModel, Document } from "@/models/document";
import { useAuth } from "@clerk/nextjs";

/**
 * Get all document IDs in a document tree starting from a root document
 * @param rootDocumentId - The ID of the root document
 * @returns Array of document IDs including the root and all its descendants
 */
export async function getAllDocsInTree(
  rootDocumentId: string
): Promise<string[]> {
  // Get the root document
  const rootDoc = await DocumentModel.findOne({ id: rootDocumentId });
  if (!rootDoc) {
    return [];
  }

  // If the root document cannot have children, return the root document ID
  if (!rootDoc.canHaveChildren) {
    return [rootDocumentId];
  }

  const children = await DocumentModel.find({ parentId: rootDocumentId });

  // Recursively get IDs for all children
  const childrenIds = await Promise.all(
    children.map((child) => getAllDocsInTree(child.id))
  );

  return [rootDocumentId, ...childrenIds.flat()];
}

/**
 * Create a document (file or folder) via API
 * @param params - Parameters for creating the document
 * @returns Promise<Document> - The created document
 */
export async function createDocument(params: {
  title: string;
  parentId?: string;
  appKey: string;
  canHaveChildren: boolean;
  canDownload: boolean;
  file?: File;
}): Promise<Document> {
  const { title, parentId, appKey, canHaveChildren, canDownload, file } =
    params;
  const { getToken } = useAuth();
  const token = await getToken();

  const formData = new FormData();
  formData.append("title", title);
  formData.append("parentId", parentId || "");
  formData.append("appKey", appKey);
  formData.append("canHaveChildren", canHaveChildren.toString());
  formData.append("canDownload", canDownload.toString());

  if (file) {
    formData.append("file", file);
  }

  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create document");
  }

  return response.json();
}
