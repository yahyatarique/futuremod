import { useMemo } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "./puck-config";
import { DataPanel } from "../ui/DataPanel";

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const EMPTY_DATA: Data = { content: [], root: { props: {} } };

function loadPageData(key: string): Data {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Data) : EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

function savePageData(key: string, data: Data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

// ---------------------------------------------------------------------------
// PuckEditor
// ---------------------------------------------------------------------------

interface PuckEditorProps {
  persistenceKey: string;
  projectSlug: string;
  pageId: string;
  onPageIdChange: (id: string) => void;
}

export function PuckEditor({
  persistenceKey,
  projectSlug,
  pageId,
  onPageIdChange,
}: PuckEditorProps) {
  const initialData = useMemo(() => loadPageData(persistenceKey), [persistenceKey]);

  return (
    <Puck
      key={persistenceKey}
      config={puckConfig}
      data={initialData}
      onChange={(data) => savePageData(persistenceKey, data)}
      onPublish={async (data) => {
        // Future: POST to Cloudflare KV via /api/publish
        savePageData(persistenceKey, data);
        console.info("[FutureMod] page published", { persistenceKey, blocks: data.content.length });
      }}
      overrides={{
        header: ({ actions }) => (
          <div className="flex h-10 items-center gap-3 border-b border-border bg-background px-4">
            <span className="text-sm font-semibold tracking-tight">FutureMod Studio</span>
            <span className="h-3 w-px bg-border" aria-hidden />
            <span className="text-xs text-muted-foreground">
              Page: <span className="font-medium text-foreground">{pageId}</span>
            </span>
            <div className="flex-1" />
            {actions}
          </div>
        ),
        components: ({ children }) => (
          <div className="flex h-full flex-col">
            <div className="shrink-0 overflow-y-auto border-b border-border" style={{ maxHeight: "52%" }}>
              <DataPanel
                projectSlug={projectSlug}
                pageId={pageId}
                onPageIdChange={onPageIdChange}
              />
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        ),
      }}
    />
  );
}
