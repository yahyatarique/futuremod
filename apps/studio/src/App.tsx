import { useEffect, useMemo, useState } from "react";
import { useDataStudio } from "./data/DataStudioContext";
import { getProjectSlugFromLocation } from "./lib/project-site";
import { getSavedPageId } from "./persistence/page-store";
import { PuckEditor } from "./canvas/PuckEditor";

export default function App() {
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
    <div className="h-screen">
      <PuckEditor
        persistenceKey={persistenceKey}
        projectSlug={projectSlug}
        pageId={pageId}
        onPageIdChange={setPageId}
      />
    </div>
  );
}
