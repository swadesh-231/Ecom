import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@/lib/api";
import { syncUser } from "@/lib/services";
import { useAuthStore } from "@/store/auth";

/**
 * Bridges Clerk and our backend:
 *  1. Registers the Clerk session-token getter with the axios client.
 *  2. On sign-in, calls POST /auth/sync to upsert the DB user and load the role.
 *  3. Clears the app user on sign-out.
 */
export const useBootstrapAuth = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const setAppUser = useAuthStore((s) => s.setAppUser);
  const setSyncing = useAuthStore((s) => s.setSyncing);

  // Keep the token getter in sync with Clerk.
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAppUser(null);
      return;
    }

    let cancelled = false;
    setSyncing(true);
    syncUser()
      .then((user) => {
        if (!cancelled) setAppUser(user);
      })
      .catch(() => {
        if (!cancelled) setAppUser(null);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, setAppUser, setSyncing]);
};
