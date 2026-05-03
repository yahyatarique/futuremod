import { Navigate } from "react-router-dom";
import { useSession } from "../auth/SessionContext";

export function HomeRedirect() {
  const { user } = useSession();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
