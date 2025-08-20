import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/ensureUser";
import connectDB from "@/lib/mongodb";

export async function GET() {
  await connectDB();

  const { dbUserId, membraneAccessToken } = await ensureUser();

  if (!dbUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({ token: membraneAccessToken });
}
