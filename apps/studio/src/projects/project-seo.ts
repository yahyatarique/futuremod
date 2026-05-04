/**
 * Optional SEO metadata stored per project (Supabase `projects.seo` + KV for edge HTML).
 * All fields are optional; the worker falls back to sensible defaults when missing.
 */
export interface ProjectSeoMeta {
  /** Primary <title> for published pages on the project subdomain */
  siteTitle?: string;
  metaDescription?: string;
  /** Comma-separated keywords for <meta name="keywords"> */
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute image URL for og:image */
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  /** Absolute site base for <link rel="canonical"> (path is appended per page) */
  canonicalBaseUrl?: string;
  /** e.g. "index, follow" or "noindex, nofollow" */
  robots?: string;
  /** For <meta name="theme-color"> */
  themeColor?: string;
  /** Absolute URL for <link rel="icon"> */
  faviconUrl?: string;
}

/** KV key segment; must not match a normal page id. */
export const PROJECT_SEO_PAGE_ID = "__seo__";

export function projectSeoKvKey(projectSlug: string): string {
  return `${projectSlug}:${PROJECT_SEO_PAGE_ID}`;
}

const SEO_STRING_KEYS = [
  "siteTitle",
  "metaDescription",
  "keywords",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "canonicalBaseUrl",
  "robots",
  "themeColor",
  "faviconUrl",
] as const;

export function normalizeProjectSeo(raw: unknown): ProjectSeoMeta {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const out: ProjectSeoMeta = {};
  for (const k of SEO_STRING_KEYS) {
    const v = o[k];
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (!t) continue;
    if (t.length > 8000) continue;
    (out as Record<string, string>)[k] = t;
  }
  const card = o.twitterCard;
  if (card === "summary" || card === "summary_large_image") {
    out.twitterCard = card;
  }
  return out;
}

export function stripEmptySeo(meta: ProjectSeoMeta): ProjectSeoMeta {
  const n = normalizeProjectSeo(meta);
  return n;
}

export function hasAnySeo(meta: ProjectSeoMeta): boolean {
  return Object.keys(stripEmptySeo(meta)).length > 0;
}

export function publishedDocumentTitle(
  meta: ProjectSeoMeta,
  projectSlug: string,
  pageId: string
): string {
  const t = meta.siteTitle?.trim();
  if (t) return t;
  const pageLabel = pageId === "default" ? "Home" : pageId;
  return `${projectSlug} · ${pageLabel}`;
}

/** Escape text for HTML text nodes and double-quoted attributes. */
export function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, " ");
}
