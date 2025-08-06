import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Record } from "@/models/record";
import { Sync } from "@/models/sync";
import { triggerPullRecords } from "@/inngest/trigger-pull-records";
import { createSyncActivity } from "@/lib/sync-activity-utils";
import { getElementKey } from "@/lib/element-key";
import { SyncStatusObject } from "@/models/types";

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

    const { id } = await params;

    const sync = await Sync.findOne({
      _id: id,
      userId: dbUserId,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    await Sync.updateOne(
      { _id: id },
      { $set: { status: SyncStatusObject.IN_PROGRESS } }
    );

    await createSyncActivity({
      syncId: id.toString(),
      userId: dbUserId,
      type: "sync_pulling",
      metadata: {
        previousPullCount: sync.pullCount || 0,
      },
    });

    await Record.deleteMany({ syncId: id, userId: dbUserId });

    await triggerPullRecords({
      userId: dbUserId,
      token: membraneAccessToken!,
      integrationKey: sync.integrationKey,
      actionKey: getElementKey(sync.recordType, "list-action"),
      syncId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to resync records:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resync records" },
      { status: 500 }
    );
  }
}
