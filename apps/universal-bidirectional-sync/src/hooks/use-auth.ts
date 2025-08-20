import { useAuth, useUser } from "@clerk/nextjs";

export function useClerkAuth() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const { user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    getToken,
    user,
  };
}
