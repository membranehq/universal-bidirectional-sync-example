import { auth, currentUser } from "@clerk/nextjs/server";
import { User } from "@/models/user";

export async function ensureUser(): Promise<{
  authUserId: string | null;
  dbUserId: string | null;
  fullName: string | null;
  email: string | null;
}> {
  const sessionAuth = await auth();

  const authUser = await currentUser();

  if (!sessionAuth.userId || !authUser) {
    return {
      authUserId: null,
      dbUserId: null,
      fullName: null,
      email: null,
    };
  }

  let dbUser = await User.findOne({ authUserId: sessionAuth.userId });

  /**
   * Ensure that the user exists in the database
   */
  if (!dbUser) {
    dbUser = await User.create({ authUserId: sessionAuth.userId });
  }

  return {
    authUserId: sessionAuth.userId,
    dbUserId: dbUser._id.toString(),
    fullName: authUser?.fullName,
    email: authUser?.emailAddresses[0].emailAddress,
  };
}
