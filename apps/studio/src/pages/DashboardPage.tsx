import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ExternalLink, Pencil, Plus } from "lucide-react";
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardShell,
  DashboardGrid,
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
  const [projects, setProjects] = useState<StoredProject[]>(() => listProjects(user!.userId));
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(() => {
    setProjects(listProjects(user!.userId));
  }, [user]);

  const createProject = () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const p = addProject(user!.userId, newTitle.trim());
      setNewTitle("");
      refresh();
      navigate(`/projects/${p.slug}/editor`);
    } finally {
      setCreating(false);
    }
  };

  const publicUrlLine = (slug: string) => `https://${slug}.${rootDomain}`;

  return (
    <div className="p-6">
      <DashboardShell
        title="Your projects"
        description="Each project has its own public link. Open the editor to design your page, then publish when you’re ready."
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <FormField label="New project name" className="min-w-[200px]">
              <Input
                placeholder="My link page"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createProject()}
              />
            </FormField>
            <Button onClick={createProject} disabled={!newTitle.trim() || creating} className="shrink-0">
              <Plus className="size-4" aria-hidden />
              Create project
            </Button>
          </div>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Give your first project a name above. You’ll jump straight into the editor to drag blocks or use help when chat arrives."
          action={
            <Button variant="accent" disabled={!newTitle.trim()} onClick={createProject}>
              <Plus className="size-4" aria-hidden />
              Create your first page
            </Button>
          }
        />
      ) : (
        <DashboardGrid cols={3}>
          {projects.map((p) => (
            <Card key={p.slug} variant="outline" padding="default" className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">{p.title}</CardTitle>
                  <Badge variant="muted" className="shrink-0 font-mono text-[10px]">
                    {p.slug}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-[11px]">{publicUrlLine(p.slug)}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-wrap gap-2 pt-0">
                <Button size="sm" onClick={() => navigate(`/projects/${p.slug}/editor`)}>
                  <Pencil className="size-3.5" aria-hidden />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${p.slug}/preview`)}>
                  <Eye className="size-3.5" aria-hidden />
                  Preview
                </Button>
                <a
                  href={publicUrlLine(p.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "text-muted-foreground")}
                >
                  <ExternalLink className="size-3.5" aria-hidden />
                  Visit
                </a>
              </CardContent>
            </Card>
          ))}
        </DashboardGrid>
      )}
    </div>
  );
}
