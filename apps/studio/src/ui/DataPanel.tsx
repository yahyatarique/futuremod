import { useContext, useEffect, useState } from "react";
import type React from "react";
import { Button, Input, Label, Select, Separator, Textarea } from "@futuremod/ui";
import { SessionContext } from "../auth/SessionContext";
import { getFuturemodRootDomain } from "../lib/project-site";
import { useDataStudio } from "../data/DataStudioContext";
import { setSavedPageId } from "../persistence/page-store";
import { useProjectSeo } from "../projects/ProjectSeoContext";
import { saveProjectSeo } from "../projects/project-db";
import { PROJECT_SEO_PAGE_ID, type ProjectSeoMeta } from "../projects/project-seo";
import { PROJECT_PUBLIC_PAGE_ID } from "../projects/project-visibility";

export function DataPanel({
  projectSlug,
  pageId,
  onPageIdChange,
  publicOnWeb = false,
  onPublicOnWebChange,
}: {
  projectSlug: string;
  pageId: string;
  onPageIdChange: (id: string) => void;
  publicOnWeb?: boolean;
  onPublicOnWebChange?: (next: boolean) => Promise<void>;
}) {
  const session = useContext(SessionContext);
  const { userId, setUserId, sources, queries, runQuery } = useDataStudio();
  const { projectSeo, setProjectSeo } = useProjectSeo();
  const [pageInput, setPageInput] = useState(pageId);
  const [seoSaveStatus, setSeoSaveStatus] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const rootDomain = getFuturemodRootDomain();

  const patchSeo = (partial: Partial<ProjectSeoMeta>) => {
    setProjectSeo((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    setPageInput(pageId);
  }, [pageId]);

  return (
    <div className="flex h-full flex-col gap-4 p-3 text-sm">
      <div>
        <h2 className="font-semibold">Project &amp; pages</h2>
        <p className="text-xs text-muted-foreground">
          Each <span className="font-medium">page</span> has its own saved <span className="font-medium">app canvas</span>{" "}
          (layout + widgets). Turn on <span className="font-medium">Share publicly</span> below to expose a live URL at{" "}
          <span className="font-mono">
            {"{project}."}
            {rootDomain}
          </span>
          ; otherwise the project stays in the dashboard only.
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
              const next = pageInput.trim() || "default";
              if (next === PROJECT_SEO_PAGE_ID || next === PROJECT_PUBLIC_PAGE_ID) return;
              onPageIdChange(next);
              setSavedPageId(userId, projectSlug, next);
            }}
          >
            Load
          </Button>
        </div>
      </div>
      {session?.user && projectSlug !== "local" && onPublicOnWebChange ? (
        <>
          <Separator />
          <div className="space-y-2 rounded-md border border-border bg-muted/15 px-2 py-2">
            <div className="flex items-start gap-2">
              <input
                id="share-public"
                type="checkbox"
                className="mt-0.5 size-3.5 shrink-0 accent-primary"
                checked={publicOnWeb}
                disabled={shareBusy}
                onChange={async (e) => {
                  const next = e.target.checked;
                  setShareBusy(true);
                  try {
                    await onPublicOnWebChange(next);
                  } catch {
                    e.target.checked = !next;
                  } finally {
                    setShareBusy(false);
                  }
                }}
              />
              <label htmlFor="share-public" className="cursor-pointer space-y-0.5 leading-snug">
                <span className="text-xs font-semibold text-foreground">Share publicly</span>
                <p className="text-[11px] text-muted-foreground">
                  Allow anyone to open{" "}
                  <span className="font-mono text-foreground">
                    https://{projectSlug}.{rootDomain}
                  </span>
                  . When off, only you can edit and preview while signed in.
                </p>
              </label>
            </div>
          </div>
        </>
      ) : null}
      {session?.user && projectSlug !== "local" ? (
        <>
          <Separator />
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-foreground">SEO (optional)</h3>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {publicOnWeb ? (
                  <>
                    Used in the HTML <span className="font-mono">&lt;head&gt;</span> when visitors open{" "}
                    <span className="font-mono">
                      https://{projectSlug}.{rootDomain}
                    </span>
                    . Publish the page to mirror these settings to the edge cache.
                  </>
                ) : (
                  <>
                    Enable <span className="font-medium">Share publicly</span> above for a live site; these tags apply when
                    your project is public.
                  </>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-site-title">Site title</Label>
              <Input
                id="seo-site-title"
                value={projectSeo.siteTitle ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ siteTitle: e.target.value })
                }
                placeholder={`${projectSlug} · Home`}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-desc">Meta description</Label>
              <Textarea
                id="seo-desc"
                value={projectSeo.metaDescription ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  patchSeo({ metaDescription: e.target.value })
                }
                placeholder="Short summary for search results and social previews"
                rows={3}
                className="min-h-0 resize-y text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-kw">Keywords</Label>
              <Input
                id="seo-kw"
                value={projectSeo.keywords ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ keywords: e.target.value })
                }
                placeholder="analytics, dashboard, …"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-og-title">Open Graph title</Label>
              <Input
                id="seo-og-title"
                value={projectSeo.ogTitle ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ ogTitle: e.target.value })
                }
                placeholder="Defaults to site title"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-og-desc">Open Graph description</Label>
              <Textarea
                id="seo-og-desc"
                value={projectSeo.ogDescription ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  patchSeo({ ogDescription: e.target.value })
                }
                placeholder="Defaults to meta description"
                rows={2}
                className="min-h-0 resize-y text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-og-img">Open Graph image URL</Label>
              <Input
                id="seo-og-img"
                value={projectSeo.ogImage ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ ogImage: e.target.value })
                }
                placeholder="https://…"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-tw">Twitter card</Label>
              <Select
                id="seo-tw"
                value={projectSeo.twitterCard ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const v = e.target.value;
                  patchSeo({
                    twitterCard:
                      v === ""
                        ? undefined
                        : (v as "summary" | "summary_large_image"),
                  });
                }}
                options={[
                  { value: "", label: "Auto (large image if OG image set)" },
                  { value: "summary", label: "summary" },
                  { value: "summary_large_image", label: "summary_large_image" },
                ]}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-canonical">Canonical base URL</Label>
              <Input
                id="seo-canonical"
                value={projectSeo.canonicalBaseUrl ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ canonicalBaseUrl: e.target.value })
                }
                placeholder={`https://${projectSlug}.${rootDomain}`}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Page path is appended (e.g. <span className="font-mono">/about</span>).
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-robots">Robots</Label>
              <Input
                id="seo-robots"
                value={projectSeo.robots ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ robots: e.target.value })
                }
                placeholder="index, follow"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-theme">Theme color</Label>
              <Input
                id="seo-theme"
                value={projectSeo.themeColor ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ themeColor: e.target.value })
                }
                placeholder="#0f172a"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seo-icon">Favicon URL</Label>
              <Input
                id="seo-icon"
                value={projectSeo.faviconUrl ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patchSeo({ faviconUrl: e.target.value })
                }
                placeholder="https://…/favicon.ico"
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8"
                onClick={async () => {
                  const u = session.user;
                  if (!u) return;
                  setSeoSaveStatus(null);
                  try {
                    await saveProjectSeo(u.userId, projectSlug, projectSeo);
                    setSeoSaveStatus("Saved to project");
                  } catch {
                    setSeoSaveStatus("Could not save (check Supabase / migration)");
                  }
                }}
              >
                Save SEO to project
              </Button>
              {seoSaveStatus ? (
                <span className="text-[11px] text-muted-foreground">{seoSaveStatus}</span>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
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
