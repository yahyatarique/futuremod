import {
  escapeHtmlAttr,
  normalizeProjectSeo,
  PROJECT_SEO_PAGE_ID,
  projectSeoKvKey,
  publishedDocumentTitle,
  type ProjectSeoMeta,
} from "./projects/project-seo";
import {
  PROJECT_PUBLIC_PAGE_ID,
  projectPublicKvKey,
} from "./projects/project-visibility";

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Env {
  PAGES_KV: KVNamespace;
  ASSETS: { fetch(request: Request): Promise<Response> };
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface PublishBody {
  projectSlug: string;
  pageId: string;
  data: unknown;
  /** When set (including `{}`), mirrored to KV + optional DB patch for edge HTML meta tags. */
  projectSeo?: unknown;
}

interface VisibilityBody {
  projectSlug: string;
  publicOnWeb: boolean;
}

async function isProjectPublic(kv: KVNamespace, projectSlug: string): Promise<boolean> {
  const v = await kv.get(projectPublicKvKey(projectSlug));
  return v === "1" || v === "true";
}

/**
 * Build tags to inject immediately after `<head>` (replaces default title).
 */
function buildSeoHeadFragment(
  meta: ProjectSeoMeta,
  projectSlug: string,
  pageId: string,
  pageUrl: string
): string {
  const title = publishedDocumentTitle(meta, projectSlug, pageId);
  const desc = meta.metaDescription?.trim() ?? "";
  const ogTitle = (meta.ogTitle?.trim() || title).trim();
  const ogDesc = (meta.ogDescription?.trim() || desc).trim();
  const ogImage = meta.ogImage?.trim() ?? "";

  const pathSuffix = pageId === "default" ? "/" : `/${pageId}`;
  const canonicalHref = meta.canonicalBaseUrl?.trim()
    ? `${meta.canonicalBaseUrl.replace(/\/$/, "")}${pathSuffix}`
    : pageUrl;

  const twCard =
    meta.twitterCard ?? (ogImage ? "summary_large_image" : "summary");

  const parts: string[] = [];
  parts.push(`<title>${escapeHtmlAttr(title)}</title>`);
  if (desc) {
    parts.push(`<meta name="description" content="${escapeHtmlAttr(desc)}">`);
  }
  const kw = meta.keywords?.trim();
  if (kw) {
    parts.push(`<meta name="keywords" content="${escapeHtmlAttr(kw)}">`);
  }
  const robots = meta.robots?.trim();
  if (robots) {
    parts.push(`<meta name="robots" content="${escapeHtmlAttr(robots)}">`);
  }
  const theme = meta.themeColor?.trim();
  if (theme) {
    parts.push(`<meta name="theme-color" content="${escapeHtmlAttr(theme)}">`);
  }

  parts.push(`<meta property="og:type" content="website">`);
  parts.push(`<meta property="og:title" content="${escapeHtmlAttr(ogTitle)}">`);
  if (ogDesc) {
    parts.push(`<meta property="og:description" content="${escapeHtmlAttr(ogDesc)}">`);
  }
  if (ogImage) {
    parts.push(`<meta property="og:image" content="${escapeHtmlAttr(ogImage)}">`);
  }
  parts.push(`<meta property="og:url" content="${escapeHtmlAttr(canonicalHref)}">`);

  parts.push(`<meta name="twitter:card" content="${escapeHtmlAttr(twCard)}">`);
  parts.push(`<meta name="twitter:title" content="${escapeHtmlAttr(ogTitle)}">`);
  if (ogDesc) {
    parts.push(`<meta name="twitter:description" content="${escapeHtmlAttr(ogDesc)}">`);
  }
  if (ogImage) {
    parts.push(`<meta name="twitter:image" content="${escapeHtmlAttr(ogImage)}">`);
  }

  parts.push(`<link rel="canonical" href="${escapeHtmlAttr(canonicalHref)}">`);

  const icon = meta.faviconUrl?.trim();
  if (icon) {
    parts.push(`<link rel="icon" href="${escapeHtmlAttr(icon)}">`);
  }

  return parts.join("");
}

/**
 * Validates a Supabase access token by calling the Supabase Auth user endpoint.
 * Returns { userId, token } on success, null on failure.
 */
async function verifySupabaseToken(
  request: Request,
  supabaseUrl: string,
  anonKey: string
): Promise<{ userId: string; token: string } | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return user.id ? { userId: user.id, token } : null;
  } catch {
    return null;
  }
}

/**
 * Upsert a publish event into the Supabase `projects` + `pages` tables.
 * Uses the user's own JWT so RLS is enforced automatically.
 * Failure is non-fatal — the KV write is the source-of-truth for serving.
 */
async function syncToDatabase(
  supabaseUrl: string,
  anonKey: string,
  token: string,
  userId: string,
  projectSlug: string,
  pageId: string,
  data: unknown,
  /** When defined (including `{}`), updates `projects.seo` for this user + slug. */
  seoPatch?: ProjectSeoMeta
): Promise<void> {
  const base = `${supabaseUrl}/rest/v1`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    apikey: anonKey,
    "Content-Type": "application/json",
  };

  // 1. Ensure the project row exists for this user + slug -------------------
  const projectRes = await fetch(`${base}/projects`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: userId,
      slug:    projectSlug,
      title:   projectSlug,
      seo:     {},
      public_on_web: false,
    }),
  });
  if (!projectRes.ok) return;

  const projects = (await projectRes.json()) as { id: string }[];
  const projectId = projects[0]?.id;
  if (!projectId) return;

  if (seoPatch !== undefined) {
    await fetch(
      `${base}/projects?user_id=eq.${encodeURIComponent(userId)}&slug=eq.${encodeURIComponent(projectSlug)}`,
      {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ seo: seoPatch }),
      }
    );
  }

  // 2. Upsert the published page snapshot ----------------------------------
  await fetch(`${base}/pages`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      project_id:     projectId,
      page_id:        pageId,
      published_data: data,
      published_at:   new Date().toISOString(),
    }),
  });
}

// Subdomains that belong to the studio itself — never treated as project pages.
const RESERVED_SLUGS = new Set(["studio", "www", "api", "local"]);

/**
 * Returns the project slug if the request is coming from a project subdomain
 * (e.g. `myproject.futuremod.site` → `"myproject"`), otherwise null.
 */
function projectSlugFromHost(hostname: string): string | null {
  const parts = hostname.split(".");
  if (parts.length === 3 && parts[1] === "futuremod" && parts[2] === "site") {
    const slug = parts[0];
    return RESERVED_SLUGS.has(slug) ? null : slug;
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── POST /api/project/visibility ────────────────────────────────────────
    if (url.pathname === "/api/project/visibility" && request.method === "POST") {
      const auth = await verifySupabaseToken(request, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = (await request.json()) as VisibilityBody;
      if (!body.projectSlug || typeof body.publicOnWeb !== "boolean") {
        return Response.json({ error: "Missing projectSlug or publicOnWeb" }, { status: 400 });
      }

      const base = `${env.SUPABASE_URL}/rest/v1`;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${auth.token}`,
        apikey: env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      };

      const patchRes = await fetch(
        `${base}/projects?user_id=eq.${encodeURIComponent(auth.userId)}&slug=eq.${encodeURIComponent(body.projectSlug)}`,
        {
          method: "PATCH",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({ public_on_web: body.publicOnWeb }),
        }
      );
      if (!patchRes.ok) {
        return Response.json({ error: "Could not update project" }, { status: patchRes.status });
      }

      if (body.publicOnWeb) {
        await env.PAGES_KV.put(projectPublicKvKey(body.projectSlug), "1");
      } else {
        await env.PAGES_KV.delete(projectPublicKvKey(body.projectSlug));
      }

      return Response.json({ ok: true });
    }

    // ── POST /api/publish ──────────────────────────────────────────────────
    if (url.pathname === "/api/publish" && request.method === "POST") {
      const auth = await verifySupabaseToken(request, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      if (!auth) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = (await request.json()) as PublishBody;
      if (!body.projectSlug || !body.pageId || !body.data) {
        return Response.json({ error: "Missing projectSlug, pageId, or data" }, { status: 400 });
      }
      if (body.pageId === PROJECT_SEO_PAGE_ID || body.pageId === PROJECT_PUBLIC_PAGE_ID) {
        return Response.json(
          {
            error: `The page id "${body.pageId}" is reserved for internal use.`,
          },
          { status: 400 }
        );
      }

      const key = `${body.projectSlug}:${body.pageId}`;
      await env.PAGES_KV.put(key, JSON.stringify(body.data));

      let seoPatch: ProjectSeoMeta | undefined;
      if (body.projectSeo !== undefined) {
        const normalized = normalizeProjectSeo(body.projectSeo);
        await env.PAGES_KV.put(projectSeoKvKey(body.projectSlug), JSON.stringify(normalized));
        seoPatch = normalized;
      }

      await syncToDatabase(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY,
        auth.token,
        auth.userId,
        body.projectSlug,
        body.pageId,
        body.data,
        seoPatch
      ).catch((err) => console.error("[FutureMod] db sync failed", err));

      return Response.json({ ok: true, key });
    }

    // ── GET /api/pages/:project/:page ──────────────────────────────────────
    if (url.pathname.startsWith("/api/pages/") && request.method === "GET") {
      const parts = url.pathname.slice("/api/pages/".length).split("/");
      if (parts.length < 2) {
        return Response.json({ error: "Expected /api/pages/:project/:page" }, { status: 400 });
      }
      const projectKey = parts[0];
      if (!(await isProjectPublic(env.PAGES_KV, projectKey))) {
        return new Response("Not found", { status: 404 });
      }
      const key = `${parts[0]}:${parts[1]}`;
      const data = await env.PAGES_KV.get(key);
      if (!data) return new Response("Not found", { status: 404 });
      return new Response(data, { headers: { "Content-Type": "application/json" } });
    }

    // ── Subdomain project-page renderer ───────────────────────────────────
    const projectSlug = projectSlugFromHost(url.hostname);
    if (projectSlug && request.method === "GET" && !url.pathname.startsWith("/assets/")) {
      if (!(await isProjectPublic(env.PAGES_KV, projectSlug))) {
        return Response.redirect("https://futuremod.site/", 302);
      }

      const pageId =
        url.pathname === "/" || url.pathname === ""
          ? "default"
          : url.pathname.slice(1).split("/")[0] || "default";

      if (pageId === PROJECT_SEO_PAGE_ID || pageId === PROJECT_PUBLIC_PAGE_ID) {
        return Response.redirect("https://futuremod.site/", 302);
      }

      const key = `${projectSlug}:${pageId}`;
      const pageData = await env.PAGES_KV.get(key);

      if (pageData) {
        const indexResponse = await env.ASSETS.fetch(
          new Request(new URL("/index.html", url).toString())
        );
        let html = await indexResponse.text();

        const seoRaw = await env.PAGES_KV.get(projectSeoKvKey(projectSlug));
        const meta = normalizeProjectSeo(seoRaw ? JSON.parse(seoRaw) : {});

        const pathOnly =
          url.pathname === "/" || url.pathname === "" ? "/" : `/${pageId}`;
        const pageUrl = `${url.origin}${pathOnly}`;

        const seoFragment = buildSeoHeadFragment(meta, projectSlug, pageId, pageUrl);
        html = html.replace(/<title>[^<]*<\/title>/i, "");
        html = html.replace("<head>", `<head>${seoFragment}`);

        const safe = pageData.replace(/</g, "\\u003c");
        const injected = html.replace(
          "</head>",
          `<script>window.__PAGE_DATA__=${safe};</script></head>`
        );

        return new Response(injected, {
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        });
      }

      return Response.redirect("https://futuremod.site/", 302);
    }

    return env.ASSETS.fetch(request);
  },
};
