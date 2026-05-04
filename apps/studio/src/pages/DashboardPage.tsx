import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Eye, Pencil, Plus, Globe } from "lucide-react";
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  FormField,
  Input,
  cn,
} from "@futuremod/ui";
import { useSession } from "../auth/SessionContext";
import {
  addProject,
  listProjects,
  type StoredProject,
} from "../projects/project-db";
import { getFuturemodRootDomain } from "../lib/project-site";
import { setProjectPublicOnWeb } from "../lib/project-visibility-api";

export function DashboardPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const rootDomain = getFuturemodRootDomain();

  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await listProjects(user.userId);
      setProjects(data);
    } catch (err) {
      console.error("[FutureMod] failed to load projects", err);
      setError("Could not load projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProject = async () => {
    if (!newTitle.trim() || !user) return;
    setCreating(true);
    setError(null);
    try {
      const p = await addProject(user.userId, newTitle.trim());
      setNewTitle("");
      setShowForm(false);
      await refresh();
      navigate(`/projects/${p.slug}/editor`);
    } catch (err) {
      console.error("[FutureMod] failed to create project", err);
      setError("Could not create project. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const publicUrl = (slug: string) => `https://${slug}.${rootDomain}`;

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Projects are private by default. Turn on <span className="font-medium text-foreground">Share publicly</span>{" "}
            on a project to serve it at <span className="font-mono">[slug].{rootDomain}</span>.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          New project
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Inline create form */}
      {showForm && (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-end gap-3">
              <FormField label="Project name" className="flex-1">
                <Input
                  autoFocus
                  placeholder="My link page"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createProject();
                    if (e.key === "Escape") setShowForm(false);
                  }}
                />
              </FormField>
              <div className="flex gap-2 pb-px">
                <Button onClick={createProject} disabled={!newTitle.trim() || creating}>
                  {creating ? "Creating…" : "Create"}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project grid */}
      {loadingProjects ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-border bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project and build your page. Keep it in the dashboard only, or share it to the web when you are ready."
          action={
            <Button variant="accent" onClick={() => setShowForm(true)}>
              <Plus className="size-4" aria-hidden />
              Create your first project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              publicUrl={publicUrl(p.slug)}
              onEdit={() => navigate(`/projects/${p.slug}/editor`)}
              onPreview={() => navigate(`/projects/${p.slug}/preview`)}
              onPublicChange={async (next) => {
                await setProjectPublicOnWeb(p.slug, next);
                await refresh();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------

function ProjectCard({
  project,
  publicUrl,
  onEdit,
  onPreview,
  onPublicChange,
}: {
  project: StoredProject;
  publicUrl: string;
  onEdit: () => void;
  onPreview: () => void;
  onPublicChange: (next: boolean) => Promise<void>;
}) {
  const [shareBusy, setShareBusy] = useState(false);

  return (
    <Card variant="outline" padding="none" className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Coloured header strip */}
      <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-end px-4 pb-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border border-border text-sm font-bold text-primary select-none">
          {project.title.slice(0, 2).toUpperCase()}
        </div>
      </div>

      <CardHeader className="px-4 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
          <Badge variant={project.publicOnWeb ? "default" : "secondary"} className="shrink-0 text-[10px]">
            {project.publicOnWeb ? "Public" : "Private"}
          </Badge>
        </div>
        {project.publicOnWeb ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-mono mt-0.5 w-fit"
          >
            <Globe className="size-3 shrink-0" aria-hidden />
            {publicUrl.replace("https://", "")}
          </a>
        ) : (
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Live URL disabled — enable Share publicly to publish to the web.
          </p>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-2 space-y-3 mt-auto">
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-muted/10 px-2 py-1.5">
          <input
            type="checkbox"
            className="mt-0.5 size-3.5 shrink-0 accent-primary"
            checked={project.publicOnWeb}
            disabled={shareBusy}
            onChange={async (e) => {
              const next = e.target.checked;
              setShareBusy(true);
              try {
                await onPublicChange(next);
              } catch {
                e.target.checked = !next;
              } finally {
                setShareBusy(false);
              }
            }}
          />
          <span className="text-[11px] leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Share publicly</span> — serve this project at{" "}
            <span className="font-mono">{publicUrl.replace("https://", "")}</span>
          </span>
        </label>
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onPreview}>
            <Eye className="size-3.5" aria-hidden />
            Preview
          </Button>
          {project.publicOnWeb ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "px-2")}
              aria-label="Visit live page"
            >
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          ) : (
            <span
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "cursor-not-allowed px-2 opacity-40")}
              aria-hidden
            >
              <ExternalLink className="size-3.5" aria-hidden />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
