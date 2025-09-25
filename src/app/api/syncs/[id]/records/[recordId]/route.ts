import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureAuth, getUserData } from "@/lib/ensureAuth";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";

import {
  ActionRunError,
  IntegrationAppClient as Membrane,
} from "@membranehq/sdk";
import { getElementKey } from "@/lib/element-key";
import { SyncStatusObject } from "@/models/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    await connectDB();
    ensureAuth(request);

    const { membraneAccessToken, user } = getUserData(request);

    const { id: syncId, recordId } = await params;
    const body = await request.json();

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

    const record = await Record.findOne({
      _id: recordId,
      syncId: syncId,
      userId: user.id,
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    // Update the record in our database first
    try {
      record.data = body;
      record.updatedAt = new Date();
      await record.save();
    } catch (dbError) {
      console.error("Failed to update record in database:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update record in database: ${
            dbError instanceof Error ? dbError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });

    // Handle Membrane integration update asynchronously
    try {
      const membrane = new Membrane({
        token: membraneAccessToken!,
      });

      // Update status to in_progress
      record.syncStatus = SyncStatusObject.IN_PROGRESS;
      record.syncError = undefined;
      await record.save();

      const updateActionKey = getElementKey(sync.appObjectKey, "update-action");

      // Update the record in the integration
      await membrane
        .connection(sync.integrationKey)
        .action(updateActionKey, {
          instanceKey: sync.instanceKey,
        })
        .run({
          id: record.externalId,
          ...body,
        });

      // Mark as completed after successful integration update
      record.syncStatus = SyncStatusObject.COMPLETED;
      await record.save();
    } catch (membraneError) {
      console.error("Failed to update record in Membrane:", membraneError);

      // Mark sync as failed
      try {
        record.syncStatus = SyncStatusObject.FAILED;
        record.syncError =
          membraneError instanceof ActionRunError
            ? membraneError.data.message
            : membraneError instanceof Error
            ? membraneError.message
            : "Unknown error occurred";
        record.updatedAt = new Date();
        await record.save();
      } catch (dbError) {
        console.error("Failed to update record status in database:", dbError);
      }
    }

    return response;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    await connectDB();
    ensureAuth(request);

    const { membraneAccessToken, user } = getUserData(request);

    const { id: syncId, recordId } = await params;

    if (!recordId) {
      return NextResponse.json(
        { success: false, message: "Record ID is required" },
        { status: 400 }
      );
    }

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

    const record = await Record.findOne({
      _id: recordId,
      syncId: syncId,
      userId: user.id,
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    // Delete the record from our database first
    try {
      await record.deleteOne();
    } catch (dbError) {
      console.error("Failed to delete record from database:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to delete record from database: ${
            dbError instanceof Error ? dbError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }

    // Return early response after successful database deletion
    const response = NextResponse.json({
      success: true,
      message: "Record deleted successfully",
    });

    // Handle Membrane integration deletion asynchronously
    try {
      const membrane = new Membrane({
        token: membraneAccessToken!,
      });

      await membrane
        .connection(sync.integrationKey)
        .action(getElementKey(sync.appObjectKey, "delete-action"), {
          instanceKey: sync.instanceKey,
        })
        .run({
          id: record.externalId,
        });
    } catch (membraneError) {
      console.error("Failed to delete record from Membrane:", membraneError);
      // Note: Record is already deleted from our database, so we just log the error
    }

    return response;
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
