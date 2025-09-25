import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureAuth, getUserData } from "@/lib/ensureAuth";
import { Record } from "@/models/record";
import { Sync } from "@/models/sync";
import { triggerPullRecords } from "@/inngest/trigger-pull-records";
import { getElementKey } from "@/lib/element-key";
import { SyncStatusObject } from "@/models/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    ensureAuth(request);

    const { membraneAccessToken, user } = getUserData(request);

    const { id } = await params;

    const sync = await Sync.findOne({
      _id: id,
      userId: user.id,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    await Sync.updateOne(
      { _id: id },
      { $set: { status: SyncStatusObject.IN_PROGRESS, pullError: null } }
    );

    await Record.deleteMany({ syncId: id, userId: user.id });

    await triggerPullRecords({
      userId: user.id,
      token: membraneAccessToken!,
      integrationKey: sync.integrationKey,
      actionKey: getElementKey(sync.appObjectKey, "list-action"),
      syncId: id,
      instanceKey: sync.instanceKey,
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
