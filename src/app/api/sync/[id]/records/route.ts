import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { createSyncActivity } from "@/lib/sync-activity-utils";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { dbUserId } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: syncId } = await params;
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json(
        { success: false, message: "Record ID is required" },
        { status: 400 }
      );
    }

    // Verify the sync exists and belongs to the user
    const sync = await Sync.findOne({
      _id: syncId,
      userId: dbUserId,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    // Find and delete the record
    const record = await Record.findOneAndDelete({
      _id: recordId,
      syncId: syncId,
      userId: dbUserId,
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    // Log the record deletion activity
    await createSyncActivity({
      syncId,
      userId: dbUserId,
      type: "event_record_deleted",
      recordId: record._id.toString(),
      metadata: {
        recordId: record.id,
        integrationKey: sync.integrationKey,
        dataSourceKey: sync.dataSourceKey,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete record:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete record" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { dbUserId } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: syncId } = await params;

    // Verify the sync exists and belongs to the user
    const sync = await Sync.findOne({
      _id: syncId,
      userId: dbUserId,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    // Get all records for this sync
    const records = await Record.find({
      syncId: syncId,
      userId: dbUserId,
    }).lean();

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Failed to fetch records:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
