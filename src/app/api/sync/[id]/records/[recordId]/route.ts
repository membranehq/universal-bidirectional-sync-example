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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    await connectDB();
    const { dbUserId, membraneAccessToken } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: syncId, recordId } = await params;
    const body = await request.json();

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

    // Update the record in our database first
    record.data = body;
    record.updatedAt = new Date();
    await record.save();

    const response = NextResponse.json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });

    try {
      // Update status to in_progress
      record.syncStatus = SyncStatusObject.IN_PROGRESS;
      record.syncError = undefined;
      await record.save();

      // Update the record in the integration
      await membrane
        .connection(sync.integrationKey)
        .action(getElementKey(sync.recordType, "update-action"), {
          instanceKey: sync.instanceKey,
        })
        .run({
          id: record.externalId,
          ...body,
        });

      // Mark as completed after successful integration update
      record.syncStatus = SyncStatusObject.COMPLETED;
      await record.save();

      await createSyncActivity({
        syncId,
        userId: dbUserId,
        type: "event_record_updated",
        recordId: record._id.toString(),
        metadata: {
          recordId: record.externalId,
          integrationKey: sync.integrationKey,
          recordType: sync.recordType,
          syncStatus: record.syncStatus,
        },
      });

      return response;
    } catch (error) {
      // Mark sync as failed
      record.syncStatus = SyncStatusObject.FAILED;
      record.syncError =
        error instanceof ActionRunError
          ? error.data.message
          : error instanceof Error
          ? error.message
          : "Unknown error occurred";
      record.updatedAt = new Date();
      await record.save();

      if (error instanceof ActionRunError) {
        throw new Error(error.data.message);
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to update record:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update record: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
