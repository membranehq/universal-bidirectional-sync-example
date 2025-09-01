import { ensureUser } from "@/lib/ensureUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const result = await ensureUser(request);

    if (result instanceof NextResponse) {
      return result;
    }

    return NextResponse.json({
      user: { id: result.id, email: result.email },
      message: "Authentication valid",
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 401 }
    );
  }
}
