import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";

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
    const records = await Record.find({
      syncId: id,
      userId: dbUserId,
    }).lean();

    return NextResponse.json({ success: true, data: { sync, records } });
  } catch (error) {
    console.error("Failed to fetch sync by id:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sync" },
      { status: 500 }
    );
  }
}
