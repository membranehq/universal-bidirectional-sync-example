import { auth, currentUser } from "@clerk/nextjs/server";
import { User } from "@/models/user";
import { generateCustomerAccessToken } from "./integration-token";

export async function ensureUser(): Promise<{
  authUserId: string | null;
  dbUserId: string | null;
  fullName: string | null;
  email: string | null;
  membraneAccessToken: string | null;
}> {
  const sessionAuth = await auth();

  const authUser = await currentUser();

  if (!sessionAuth.userId || !authUser) {
    return {
      authUserId: null,
      dbUserId: null,
      fullName: null,
      email: null,
      membraneAccessToken: null,
    };
  }

  let dbUser = await User.findOne({ authUserId: sessionAuth.userId });

  /**
   * Ensure that  user with this authUserId exists in the database
   */
  if (!dbUser) {
    dbUser = await User.create({ authUserId: sessionAuth.userId });
  }

  /**
   * Generate a membrane access token for the user.
   * This is needed for the user to access the membrane API.
   */
  const token = await generateCustomerAccessToken({
    id: dbUser._id.toString(),
    name: authUser.fullName || `$user-${dbUser._id.toString()}`,
  });

  return {
    authUserId: sessionAuth.userId,
    dbUserId: dbUser._id.toString(),
    fullName: authUser?.fullName,
    email: authUser?.emailAddresses[0].emailAddress,
    membraneAccessToken: token,
  };
}
