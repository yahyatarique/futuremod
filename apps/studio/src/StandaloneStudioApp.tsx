import { useEffect, useMemo, useState } from "react";
import { useDataStudio } from "./data/DataStudioContext";
import { getProjectSlugFromLocation } from "./lib/project-site";
import { getSavedPageId } from "./persistence/page-store";
import { PuckEditor } from "./canvas/PuckEditor";

/**
 * Direct editor shell for `{project}.{rootDomain}` when there is no `__PAGE_DATA__`
 * and the slug is not the marketing apex/root. Bypasses dashboard login flow.
 */
export function StandaloneStudioApp() {
  const projectSlug = useMemo(() => getProjectSlugFromLocation(), []);
  const { userId } = useDataStudio();
  const [pageId, setPageId] = useState(() => getSavedPageId(userId, projectSlug));

  useEffect(() => {
    setPageId(getSavedPageId(userId, projectSlug));
  }, [userId, projectSlug]);

  const persistenceKey = useMemo(
    () => `futuremod-puck:${projectSlug}:${userId}:${pageId}`,
    [projectSlug, userId, pageId]
  );

  return (
    <div className="h-screen bg-background">
      <PuckEditor
        persistenceKey={persistenceKey}
        projectSlug={projectSlug}
        pageId={pageId}
        onPageIdChange={setPageId}
      />
    </div>
  );
}
