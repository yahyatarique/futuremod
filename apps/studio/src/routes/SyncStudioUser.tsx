import { useEffect } from "react";
import { useSession } from "../auth/SessionContext";
import { useDataStudio } from "../data/DataStudioContext";

/** Keep DataStudio analytics keys aligned with authenticated account userId. */
export function SyncStudioUser() {
  const { user } = useSession();
  const { setUserId } = useDataStudio();

  useEffect(() => {
    setUserId(user?.userId ?? "local-user");
  }, [user?.userId, setUserId]);

  return null;
}
