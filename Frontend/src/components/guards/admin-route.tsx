import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router";
import { Loader } from "@/components/common/loader";
import { useAuthStore } from "@/store/auth";

/** Allows only signed-in admins; everyone else is sent home. */
export function AdminRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const appUser = useAuthStore((s) => s.appUser);
  const isSyncing = useAuthStore((s) => s.isSyncing);

  if (!isLoaded || isSyncing) return <Loader className="min-h-[60vh]" />;

  if (!isSignedIn) return <Navigate to="/sign-in" replace />;

  // Wait until the role has been synced before deciding.
  if (!appUser) return <Loader className="min-h-[60vh]" />;

  if (appUser.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
