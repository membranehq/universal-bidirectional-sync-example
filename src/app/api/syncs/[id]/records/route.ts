import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureAuth, getUserData } from "@/lib/ensureAuth";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { SyncActivity } from "@/models/sync-activity";
import { IntegrationAppClient as Membrane } from "@membranehq/sdk";
import { getElementKey } from "@/lib/element-key";
import { SyncStatusObject } from "@/models/types";

/**
 * Create a record for a sync
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    ensureAuth(request);

    const { membraneAccessToken, user } = getUserData(request);

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
      userId: user.id,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    const record = new Record({
      userId: user.id,
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
      const actionKey = getElementKey(sync.appObjectKey, "create-action");

      console.log({ actionKey, sync });

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

    try {
      await SyncActivity.create({
        syncId,
        userId: user.id,
        type: "event_record_created",
        recordId: record._id.toString(),
        metadata: {
          recordId: record.externalId,
          integrationKey: sync.integrationKey,
          appObjectKey: sync.appObjectKey,
          syncStatus: record.syncStatus,
          syncError: record.syncError,
        },
      });
    } catch (error) {
      console.error("Failed to create sync activity:", error);
      // Don't throw error to avoid breaking the main flow
    }

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

/**
 * Get records for a sync
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    ensureAuth(request);

    const { user } = getUserData(request);

    const { id: syncId } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Verify the sync exists and belongs to the user
    const sync = await Sync.findOne({
      _id: syncId,
      userId: user.id,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of records for this sync
    const totalRecords = await Record.countDocuments({
      syncId: syncId,
      userId: user.id,
    });

    // Get paginated records for this sync, sorted by creation date (newest first)
    const records = await Record.find({
      syncId: syncId,
      userId: user.id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .allowDiskUse(true)
      .exec();

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        startRecord: skip + 1,
        endRecord: Math.min(skip + limit, totalRecords),
      },
    });
  } catch (error) {
    console.error("Failed to fetch records:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
