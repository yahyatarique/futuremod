import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, FolderOpen } from "lucide-react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { buttonVariants, cn } from "@futuremod/ui";
import { supabase } from "../lib/supabase";
import { puckConfig } from "./puck-config";
import { DataPanel } from "../ui/DataPanel";
import { loadPageData, savePageData } from "../persistence/puck-storage";

// ---------------------------------------------------------------------------
// Settings popover
// ---------------------------------------------------------------------------

function SettingsPopover({
  projectSlug,
  pageId,
  onPageIdChange,
}: {
  projectSlug: string;
  pageId: string;
  onPageIdChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid hsl(var(--border))",
          background: open ? "hsl(var(--muted))" : "transparent",
          cursor: "pointer",
          color: "hsl(var(--muted-foreground))",
          flexShrink: 0,
        }}
      >
        {/* gear icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49 }}
            onClick={() => setOpen(false)}
          />
          {/* panel */}
          <div
            style={{
              position: "fixed",
              top: 44,
              right: 12,
              width: 300,
              maxHeight: "calc(100vh - 56px)",
              overflowY: "auto",
              zIndex: 50,
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              boxShadow: "0 8px 32px -4px hsl(0 0% 0% / 0.18)",
            }}
          >
            <DataPanel
              projectSlug={projectSlug}
              pageId={pageId}
              onPageIdChange={(id) => { onPageIdChange(id); setOpen(false); }}
            />
          </div>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// PuckEditor
// ---------------------------------------------------------------------------

interface PuckEditorProps {
  persistenceKey: string;
  projectSlug: string;
  pageId: string;
  onPageIdChange: (id: string) => void;
  dashboardHref?: string;
  previewHref?: string;
  /** Called after a successful publish round-trip so the dashboard can bump “last updated.” */
  onPublished?: () => void;
}

export function PuckEditor({
  persistenceKey,
  projectSlug,
  pageId,
  onPageIdChange,
  dashboardHref,
  previewHref,
  onPublished,
}: PuckEditorProps) {
  const initialData = useMemo(() => loadPageData(persistenceKey), [persistenceKey]);

  return (
    <Puck
      key={persistenceKey}
      config={puckConfig}
      data={initialData}
      onChange={(data) => savePageData(persistenceKey, data)}
      onPublish={async (data) => {
        savePageData(persistenceKey, data);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch("/api/publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(session?.access_token
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
            body: JSON.stringify({ projectSlug, pageId, data }),
          });
          if (!res.ok) throw new Error(await res.text());
          console.info("[FutureMod] published", { projectSlug, pageId, blocks: data.content.length });
          onPublished?.();
        } catch (err) {
          console.error("[FutureMod] publish failed", err);
        }
      }}
      overrides={{
        header: ({ actions }) => (
          <div className="flex h-10 items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4">
            {dashboardHref ? (
              <Link
                to={dashboardHref}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0 gap-1.5")}
              >
                <FolderOpen className="size-4" aria-hidden />
                <span className="hidden sm:inline">Projects</span>
              </Link>
            ) : (
              <span className="text-sm font-semibold tracking-tight">FutureMod Studio</span>
            )}
            <span className="h-3 w-px shrink-0 bg-border" aria-hidden />
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              <span className="hidden sm:inline">Page: </span>
              <span className="font-medium text-foreground">{pageId}</span>
            </span>
            <div className="flex-1" />
            {previewHref ? (
              <Link
                to={previewHref}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1.5")}
              >
                <Eye className="size-3.5" aria-hidden />
                Preview
              </Link>
            ) : null}
            {actions}
            <SettingsPopover
              projectSlug={projectSlug}
              pageId={pageId}
              onPageIdChange={onPageIdChange}
            />
          </div>
        ),
      }}
    />
  );
}
