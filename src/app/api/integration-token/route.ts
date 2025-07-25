import { NextResponse } from "next/server";
import { generateCustomerAccessToken } from "@/lib/integration-token";
import { ensureUser } from "@/lib/ensureUser";
import connectDB from "@/lib/mongodb";

export async function GET() {
  await connectDB();

  const { dbUserId, fullName } = await ensureUser();

  if (!dbUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const token = await generateCustomerAccessToken({
    id: dbUserId,
    name: fullName || `$user-${dbUserId}`,
  });

  return NextResponse.json({ token });
}
