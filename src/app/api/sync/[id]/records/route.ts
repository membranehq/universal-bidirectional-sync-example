import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { createSyncActivity } from "@/lib/sync-activity-utils";
import {
  ActionRunError,
  IntegrationAppClient as Membrane,
} from "@integration-app/sdk";
import { getElementKey } from "@/lib/element-key";
import { SyncStatusObject } from "@/models/types";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { dbUserId, membraneAccessToken } = await ensureUser();

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

    const record = await Record.findOne({
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

    const membrane = new Membrane({
      token: membraneAccessToken!,
    });

    try {
      await membrane
        .connection(sync.integrationKey)
        .action(`delete-${sync.recordType}`, {
          instanceKey: sync.instanceKey,
        })
        .run({
          id: record.externalId,
        });
    } catch (error) {
      if (error instanceof ActionRunError) {
        throw new Error(error.data.message);
      }

      throw error;
    }

    await record.deleteOne();

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    await createSyncActivity({
      syncId,
      userId: dbUserId,
      type: "event_record_deleted",
      recordId: record._id.toString(),
      metadata: {
        recordId: record.externalId,
        integrationKey: sync.integrationKey,
        recordType: sync.recordType,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete record:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to delete record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { dbUserId, membraneAccessToken } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: syncId } = await params;
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Record data is required" },
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

    const record = new Record({
      userId: dbUserId,
      syncId: syncId,
      data: data,
      syncStatus: SyncStatusObject.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await record.save();

    const response = NextResponse.json({
      success: true,
      data: record,
      message: "Record created successfully",
    });

    // After response
    const membrane = new Membrane({
      token: membraneAccessToken!,
    });

    try {
      // Update status to in_progress
      record.syncStatus = SyncStatusObject.IN_PROGRESS;
      await record.save();

      // Create the record in the integration
      const actionKey = getElementKey(sync.recordType, "create-action");

      const result = await membrane
        .connection(sync.integrationKey)
        .action(actionKey, {
          instanceKey: sync.instanceKey,
        })
        .run(data);

      // Update the record with the integration data and mark as completed
      record.externalId = result.output.id;
      record.syncStatus = SyncStatusObject.COMPLETED;
      record.updatedAt = new Date();
      await record.save();
    } catch (e) {
      // Mark sync of record as failed
      console.error("Failed to create record:", e);
      record.syncStatus = SyncStatusObject.FAILED;
      record.syncError =
        e instanceof Error ? e.message : "Unknown error occurred";
      record.updatedAt = new Date();
      await record.save();
    }

    await createSyncActivity({
      syncId,
      userId: dbUserId,
      type: "event_record_created",
      recordId: record._id.toString(),
      metadata: {
        recordId: record.externalId,
        integrationKey: sync.integrationKey,
        recordType: sync.recordType,
        syncStatus: record.syncStatus,
        syncError: record.syncError,
      },
    });

    return response;
  } catch (error) {
    console.error("Failed to create record:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to create record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
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

    // Get all records for this sync, sorted by creation date (newest first)
    const records = await Record.find({
      syncId: syncId,
      userId: dbUserId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .allowDiskUse(true)
      .exec();

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
