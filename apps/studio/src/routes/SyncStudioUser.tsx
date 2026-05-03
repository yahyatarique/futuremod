import { useEffect } from "react";
import { useSession } from "../auth/SessionContext";
import { useDataStudio } from "../data/DataStudioContext";

/** Keep DataStudio analytics keys aligned with the authenticated Supabase user id. */
export function SyncStudioUser() {
  const { user } = useSession();
  const { setUserId } = useDataStudio();

  useEffect(() => {
    setUserId(user?.userId ?? "local-user");
  }, [user?.userId, setUserId]);

  return null;
}
