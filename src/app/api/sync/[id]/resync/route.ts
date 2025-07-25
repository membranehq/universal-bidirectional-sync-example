import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Record } from "@/models/record";
import { Sync } from "@/models/sync";
import { syncRecords } from "@/app/api/sync/sync-records";
import { generateCustomerAccessToken } from "@/lib/integration-token";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { dbUserId, fullName } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await params as per Next.js 15 dynamic API migration
    const { id } = await params;

    // Find the sync config
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

    // Update sync status to in_progress and increment syncCount
    await Sync.updateOne(
      { _id: id },
      { $set: { status: "in_progress"} }
    );

    // Delete all records for this syncId and userId
    await Record.deleteMany({ syncId: id, userId: dbUserId });

    // Generate token for integration
    const token = await generateCustomerAccessToken({
      id: dbUserId,
      name: fullName || `$user-${dbUserId}`,
    });

    // Respond early after creating the sync
    const response = NextResponse.json({ success: true });

    // Pull in records using syncRecords
    await syncRecords({
      userId: dbUserId,
      token,
      integrationKey: sync.integrationKey,
      actionId: `get-${sync.dataSourceKey}`,
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
