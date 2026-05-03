import { useContext, useEffect, useState } from "react";
import type React from "react";
import { Button, Input, Label, Separator } from "@futuremod/ui";
import { SessionContext } from "../auth/SessionContext";
import { getFuturemodRootDomain } from "../lib/project-site";
import { useDataStudio } from "../data/DataStudioContext";
import { setSavedPageId } from "../persistence/page-store";

export function DataPanel({
  projectSlug,
  pageId,
  onPageIdChange,
}: {
  projectSlug: string;
  pageId: string;
  onPageIdChange: (id: string) => void;
}) {
  const session = useContext(SessionContext);
  const { userId, setUserId, sources, queries, runQuery } = useDataStudio();
  const [pageInput, setPageInput] = useState(pageId);
  const rootDomain = getFuturemodRootDomain();

  useEffect(() => {
    setPageInput(pageId);
  }, [pageId]);

  return (
    <div className="flex h-full flex-col gap-4 p-3 text-sm">
      <div>
        <h2 className="font-semibold">Project &amp; pages</h2>
        <p className="text-xs text-muted-foreground">
          Production URL:{" "}
          <span className="font-medium text-foreground">
            {"{project}."}
            {rootDomain}
          </span>
          . Each <span className="font-medium">page</span> has its own saved <span className="font-medium">app canvas</span>{" "}
          (layout + widgets). Use <span className="font-medium">userId</span> + <span className="font-medium">page id</span>{" "}
          to switch pages.
        </p>
        {projectSlug !== "local" && projectSlug !== "root" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Project: <span className="font-mono text-foreground">{projectSlug}</span>
          </p>
        )}
      </div>
      {session?.user ? (
        <div className="rounded-md border border-border bg-muted/20 px-2 py-1.5 text-xs">
          <span className="text-muted-foreground">Signed in as </span>
          <span className="font-medium text-foreground">{session.user.email}</span>
        </div>
      ) : (
        <div className="space-y-1">
          <Label htmlFor="user">Developer user id</Label>
          <Input
            id="user"
            value={userId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="page">Page id</Label>
        <div className="flex gap-1">
          <Input
            id="page"
            value={pageInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageInput(e.target.value)}
            className="h-8 flex-1 text-xs"
          />
          <Button
            size="sm"
            className="h-8 shrink-0"
            onClick={() => {
              onPageIdChange(pageInput.trim() || "default");
              setSavedPageId(userId, projectSlug, pageInput.trim() || "default");
            }}
          >
            Load
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">Data sources</h3>
        <ul className="space-y-1 text-xs">
          {sources.map((s) => (
            <li key={s.id} className="rounded border border-border px-2 py-1">
              <span className="font-medium">{s.name}</span>{" "}
              <span className="text-muted-foreground">({s.kind})</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Connect live databases through your own API so credentials stay server-side; Studio binds widgets to queries here.
        </p>
      </div>
      <Separator />
      <div>
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">Saved queries</h3>
        <ul className="space-y-2 text-xs">
          {queries.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1">
              <span className="truncate">{q.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 shrink-0 px-2 text-[10px]"
                onClick={async () => {
                  const res = await runQuery(q.id);
                  console.info("[FutureMod Studio] query result", q.id, res);
                }}
              >
                Test
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
