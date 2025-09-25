import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureAuth, getUserData } from "@/lib/ensureAuth";
import { Sync } from "@/models/sync";
import { SyncActivity } from "@/models/sync-activity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    ensureAuth(request);

    const { user } = getUserData(request);

    const sync = await Sync.findOne({
      _id: user.id,
      userId: user.id,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    const { id: syncId } = await params;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const activities = await await SyncActivity.find({
      syncId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      activities,
      sync: {
        id: sync._id,
        integrationName: sync.integrationName,
        status: sync.status,
      },
    });
  } catch (error) {
    console.error("Failed to get sync activities:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get sync activities" },
      { status: 500 }
    );
  }
}
