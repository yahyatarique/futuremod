import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "../auth/SessionContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const location = useLocation();

  // Wait for Supabase to restore the session before deciding.
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
