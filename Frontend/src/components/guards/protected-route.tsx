import { useAuth } from "@clerk/react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Loader } from "@/components/common/loader";

/** Blocks unauthenticated users, redirecting them to sign-in. */
export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) return <Loader className="min-h-[60vh]" />;

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
