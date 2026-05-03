import { useCallback, useEffect, useMemo, useState } from "react";
import type { Editor } from "tldraw";
import { StudioCanvas } from "./canvas/StudioCanvas";
import { useDataStudio } from "./data/DataStudioContext";
import { getFuturemodRootDomain, getProjectSlugFromLocation } from "./lib/project-site";
import { getSavedPageId } from "./persistence/page-store";
import { ComponentPalette } from "./ui/ComponentPalette";
import { DataPanel } from "./ui/DataPanel";

export default function App() {
  const projectSlug = useMemo(() => getProjectSlugFromLocation(), []);
  const rootDomain = useMemo(() => getFuturemodRootDomain(), []);
  const { userId } = useDataStudio();
  const [pageId, setPageId] = useState(() => getSavedPageId(userId, projectSlug));

  useEffect(() => {
    setPageId(getSavedPageId(userId, projectSlug));
  }, [userId, projectSlug]);
  const [editor, setEditor] = useState<Editor | null>(null);

  const persistenceKey = useMemo(
    () => `futuremod-studio:${projectSlug}:${userId}:${pageId}`,
    [projectSlug, userId, pageId]
  );

  const onEditorMount = useCallback((e: Editor) => {
    setEditor(e);
  }, []);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="flex h-11 shrink-0 items-center border-b border-border px-4">
        <span className="text-sm font-semibold tracking-tight">FutureMod Studio</span>
        <span className="ml-3 flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 truncate text-xs text-muted-foreground">
          <span className="shrink-0 font-medium text-foreground">Page: {pageId}</span>
          <span className="hidden h-3 w-px bg-border sm:inline" aria-hidden />
          {projectSlug === "local" ? (
            <>
              Development · set <code className="rounded bg-muted px-1">VITE_FUTUREMOD_PROJECT_SLUG</code> to match{" "}
              <span className="font-mono">
                {"{project}."}
                {rootDomain}
              </span>
            </>
          ) : projectSlug === "root" ? (
            <>Apex ({rootDomain}) — open a project subdomain for your app.</>
          ) : (
            <>
              <span className="font-medium text-foreground">{projectSlug}</span>
              <span className="text-muted-foreground">.{rootDomain}</span>
            </>
          )}
        </span>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 border-r border-border bg-card/40">
          <DataPanel projectSlug={projectSlug} pageId={pageId} onPageIdChange={setPageId} />
        </aside>
        <main className="relative min-w-0 flex-1">
          <StudioCanvas key={persistenceKey} persistenceKey={persistenceKey} onEditorMount={onEditorMount} />
        </main>
        <aside className="w-64 shrink-0 border-l border-border bg-card/40">
          <ComponentPalette editor={editor} />
        </aside>
      </div>
    </div>
  );
}
