import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSession } from "../auth/SessionContext";
import { getSavedPageId, setSavedPageId } from "../persistence/page-store";
import { PuckEditor } from "../canvas/PuckEditor";
import { setProjectPublicOnWeb } from "../lib/project-visibility-api";
import {
  fetchProjectPublicOnWeb,
  fetchProjectSeo,
  touchProject,
} from "../projects/project-db";
import { ProjectSeoProvider } from "../projects/ProjectSeoContext";
import type { ProjectSeoMeta } from "../projects/project-seo";
import { publishedDocumentTitle } from "../projects/project-seo";

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

  const [projectSeo, setProjectSeo] = useState<ProjectSeoMeta>({});
  const [publicOnWeb, setPublicOnWeb] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seo = await fetchProjectSeo(userId, projectSlug);
        if (!cancelled) setProjectSeo(seo);
      } catch {
        if (!cancelled) setProjectSeo({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, projectSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pub = await fetchProjectPublicOnWeb(userId, projectSlug);
        if (!cancelled) setPublicOnWeb(pub);
      } catch {
        if (!cancelled) setPublicOnWeb(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, projectSlug]);

  const handlePublicOnWebChange = useCallback(
    async (next: boolean) => {
      await setProjectPublicOnWeb(projectSlug, next);
      setPublicOnWeb(next);
    },
    [projectSlug]
  );

  useEffect(() => {
    document.title = `${publishedDocumentTitle(projectSeo, projectSlug, pageId)} · Studio`;
  }, [projectSeo, projectSlug, pageId]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <ProjectSeoProvider projectSeo={projectSeo} setProjectSeo={setProjectSeo}>
        <PuckEditor
          persistenceKey={persistenceKey}
          projectSlug={projectSlug}
          pageId={pageId}
          onPageIdChange={applyPageId}
          dashboardHref="/dashboard"
          previewHref={`/projects/${projectSlug}/preview?page=${encodeURIComponent(pageId)}`}
          onPublished={handlePublished}
          publicOnWeb={publicOnWeb}
          onPublicOnWebChange={handlePublicOnWebChange}
        />
      </ProjectSeoProvider>
    </div>
  );
}
