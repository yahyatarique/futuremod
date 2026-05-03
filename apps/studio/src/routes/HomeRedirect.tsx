import { Navigate } from "react-router-dom";
import { useSession } from "../auth/SessionContext";

export function HomeRedirect() {
  const { user, loading } = useSession();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
