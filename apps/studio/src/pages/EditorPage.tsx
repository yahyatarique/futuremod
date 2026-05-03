import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSession } from "../auth/SessionContext";
import { getSavedPageId, setSavedPageId } from "../persistence/page-store";
import { PuckEditor } from "../canvas/PuckEditor";
import { touchProject } from "../projects/project-db";

export function EditorPage() {
  const { projectSlug = "local" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSession();
  const userId = user!.userId;

  const [pageId, setPageId] = useState(() => {
    const q = searchParams.get("page")?.trim();
    return q || getSavedPageId(userId, projectSlug);
  });

  /** Keep a shareable `?page=` on first editor load when it was omitted. */
  useEffect(() => {
    const q = searchParams.get("page")?.trim();
    if (!q) {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("page", pageId);
          return p;
        },
        { replace: true }
      );
    }
  }, [projectSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const q = searchParams.get("page")?.trim();
    if (q && q !== pageId) {
      setPageId(q);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPageId = useCallback(
    (id: string) => {
      const next = id.trim() || "default";
      setPageId(next);
      setSavedPageId(userId, projectSlug, next);
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("page", next);
          return p;
        },
        { replace: true }
      );
    },
    [userId, projectSlug, setSearchParams]
  );

  const persistenceKey = useMemo(
    () => `futuremod-puck:${projectSlug}:${userId}:${pageId}`,
    [projectSlug, userId, pageId]
  );

  const handlePublished = useCallback(() => {
    touchProject(userId, projectSlug);
  }, [userId, projectSlug]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <PuckEditor
        persistenceKey={persistenceKey}
        projectSlug={projectSlug}
        pageId={pageId}
        onPageIdChange={applyPageId}
        dashboardHref="/dashboard"
        previewHref={`/projects/${projectSlug}/preview?page=${encodeURIComponent(pageId)}`}
        onPublished={handlePublished}
      />
    </div>
  );
}
