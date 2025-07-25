import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/server-auth";
import connectDB from "@/lib/mongodb";
import { DocumentModel } from "@/models/document";
import { triggerDownloadDocumentFlow } from "@/lib/flows";
import { generateCustomerAccessToken } from "@/lib/integration-token";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.customerId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const documentId = (await params).id;

    await connectDB();

    const document = await DocumentModel.findOne({
      id: documentId,
      userId: auth.customerId,
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    if (!document.canDownload) {
      return new NextResponse("Document is not downloadable", { status: 403 });
    }

    const token = await generateCustomerAccessToken(auth);

    await triggerDownloadDocumentFlow(token, document.appKey, documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error triggering download flow:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
