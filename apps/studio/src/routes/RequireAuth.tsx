import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "../auth/SessionContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
