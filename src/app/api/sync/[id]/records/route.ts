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
import { getSingularForm } from "@/lib/pluralize-utils";

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
        .action(`delete-${getSingularForm(sync.dataSourceKey)}`, {
          instanceKey: sync.instanceKey,
        })
        .run({
          id: record.id,
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
