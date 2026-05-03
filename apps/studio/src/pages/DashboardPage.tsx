import { useCallback, useState } from "react";
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
import { addProject, listProjects, type StoredProject } from "../projects/project-storage";
import { getFuturemodRootDomain } from "../lib/project-site";

export function DashboardPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const rootDomain = getFuturemodRootDomain();
  const [projects, setProjects] = useState<StoredProject[]>(() =>
    listProjects(user!.userId)
  );
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    setProjects(listProjects(user!.userId));
  }, [user]);

  const createProject = () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const p = addProject(user!.userId, newTitle.trim());
      setNewTitle("");
      setShowForm(false);
      refresh();
      navigate(`/projects/${p.slug}/editor`);
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
            Each project gets a public link at{" "}
            <span className="font-mono">[slug].{rootDomain}</span>
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="shrink-0">
          <Plus className="size-4" aria-hidden />
          New project
        </Button>
      </div>

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
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project and start building your public page."
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
}: {
  project: StoredProject;
  publicUrl: string;
  onEdit: () => void;
  onPreview: () => void;
}) {
  return (
    <Card variant="outline" padding="none" className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Coloured header strip */}
      <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-end px-4 pb-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border border-border text-sm font-bold text-primary select-none">
          {project.title.slice(0, 2).toUpperCase()}
        </div>
      </div>

      <CardHeader className="px-4 pt-3 pb-1">
        <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-mono mt-0.5 w-fit"
        >
          <Globe className="size-3 shrink-0" aria-hidden />
          {publicUrl.replace("https://", "")}
        </a>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-2 mt-auto flex items-center gap-1.5">
        <Button size="sm" className="flex-1" onClick={onEdit}>
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={onPreview}>
          <Eye className="size-3.5" aria-hidden />
          Preview
        </Button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "px-2")}
          aria-label="Visit live page"
        >
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </CardContent>
    </Card>
  );
}
