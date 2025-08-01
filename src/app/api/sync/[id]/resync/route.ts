import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Record } from "@/models/record";
import { Sync } from "@/models/sync";
import { triggerSyncRecords } from "@/inngest/trigger-sync-records";
import { createSyncActivity } from "@/lib/sync-activity-utils";

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

    await Sync.updateOne({ _id: id }, { $set: { status: "in_progress" } });

    // Track resync started activity
    await createSyncActivity({
      syncId: id.toString(),
      userId: dbUserId,
      type: "sync_resync_triggered",
      metadata: {
        previousSyncCount: sync.syncCount || 0,
      },
    });

    await Record.deleteMany({ syncId: id, userId: dbUserId });

    // Respond early after creating the sync
    const response = NextResponse.json({ success: true });

    // Trigger sync records using Inngest
    await triggerSyncRecords({
      userId: dbUserId,
      token: membraneAccessToken!,
      integrationKey: sync.integrationKey,
      actionId: `get-${sync.recordType}`,
      syncId: id,
    });

    return response;
  } catch (error) {
    console.error("Failed to resync records:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resync records" },
      { status: 500 }
    );
  }
}
