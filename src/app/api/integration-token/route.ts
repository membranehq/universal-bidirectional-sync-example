import { NextResponse, NextRequest } from "next/server";
import { ensureUser } from "@/lib/ensureUser";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const result = await ensureUser(request);

    if (result instanceof NextResponse) {
      return result;
    }

    const { membraneAccessToken } = result;

    return NextResponse.json({ token: membraneAccessToken });
  } catch (error) {
    console.error("Error getting integration token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
