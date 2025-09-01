import { User } from "@/models/user";
import { generateCustomerAccessToken } from "./integration-token";
import { getAuthUser } from "./auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function ensureUser(request: NextRequest) {
  const user = await getAuthUser(request);

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  /**
   * Generate a membrane access token for the user.
   * This is needed for the user to access the membrane API.
   */
  const token = await generateCustomerAccessToken({
    id: user.id,
    name: `${user.email}-${user.id}`,
  });

  return {
    id: user.id,
    email: user.email,
    membraneAccessToken: token,
  };
}
