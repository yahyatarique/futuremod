import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Render } from "@measured/puck";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@futuremod/ui";
import { ThemeToggle } from "../theme/ThemeToggle";
import { puckConfig } from "../canvas/puck-config";
import { loadPageData } from "../persistence/puck-storage";
import { useSession } from "../auth/SessionContext";

export function PreviewPage() {
  const { projectSlug = "local" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSession();

  const pageId = searchParams.get("page")?.trim() || "default";
  const persistenceKey = useMemo(
    () => `futuremod-puck:${projectSlug}:${user!.userId}:${pageId}`,
    [projectSlug, user!.userId, pageId]
  );

  const data = useMemo(() => loadPageData(persistenceKey), [persistenceKey]);

  return (
    <div className="min-h-screen">
      <header className="flex h-11 items-center justify-between gap-3 border-b border-border bg-card/40 px-3">
        <div className="flex flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(`/projects/${projectSlug}/editor?page=${encodeURIComponent(pageId)}`)
            }
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to editor
          </Button>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Preview — not what visitors see until you publish.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${projectSlug}/editor?page=${encodeURIComponent(pageId)}`)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit layout
          </Button>
        </div>
      </header>
      <Render config={puckConfig} data={data} />
    </div>
  );
}
