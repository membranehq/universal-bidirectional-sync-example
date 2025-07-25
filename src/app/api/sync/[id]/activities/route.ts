import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Sync } from "@/models/sync";
import { getSyncActivities } from "@/lib/sync-activity-utils";

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const activities = await getSyncActivities(id.toString(), limit);

    return NextResponse.json({
      success: true,
      activities,
      sync: {
        id: sync._id,
        integrationName: sync.integrationName,
        status: sync.status,
        syncCount: sync.syncCount,
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
