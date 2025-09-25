import { NextResponse, NextRequest } from "next/server";
import { ensureAuth, getUserData } from "@/lib/ensureAuth";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  ensureAuth(request);

  try {
    await connectDB();

    const { membraneAccessToken } = getUserData(request);

    return NextResponse.json({ token: membraneAccessToken });
  } catch (error) {
    console.error("Error getting integration token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
