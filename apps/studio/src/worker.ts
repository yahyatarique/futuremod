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
}

/**
 * Validates a Supabase access token by calling the Supabase Auth user endpoint.
 * Returns the user id on success, null on failure.
 */
async function getSupabaseUserId(
  request: Request,
  supabaseUrl: string,
  anonKey: string
): Promise<string | null> {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return user.id ?? null;
  } catch {
    return null;
  }
}

// Subdomains that belong to the studio itself — never treated as project pages.
const RESERVED_SLUGS = new Set(["studio", "www", "api", "local"]);

/**
 * Returns the project slug if the request is coming from a project subdomain
 * (e.g. `myproject.futuremod.site` → `"myproject"`), otherwise null.
 */
function projectSlugFromHost(hostname: string): string | null {
  const parts = hostname.split(".");
  // Match *.futuremod.site exactly
  if (parts.length === 3 && parts[1] === "futuremod" && parts[2] === "site") {
    const slug = parts[0];
    return RESERVED_SLUGS.has(slug) ? null : slug;
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── POST /api/publish ──────────────────────────────────────────────────
    if (url.pathname === "/api/publish" && request.method === "POST") {
      const userId = await getSupabaseUserId(request, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
      if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = (await request.json()) as PublishBody;
      if (!body.projectSlug || !body.pageId || !body.data) {
        return Response.json({ error: "Missing projectSlug, pageId, or data" }, { status: 400 });
      }
      const key = `${body.projectSlug}:${body.pageId}`;
      await env.PAGES_KV.put(key, JSON.stringify(body.data));
      return Response.json({ ok: true, key });
    }

    // ── GET /api/pages/:project/:page ──────────────────────────────────────
    if (url.pathname.startsWith("/api/pages/") && request.method === "GET") {
      const parts = url.pathname.slice("/api/pages/".length).split("/");
      if (parts.length < 2) {
        return Response.json({ error: "Expected /api/pages/:project/:page" }, { status: 400 });
      }
      const key = `${parts[0]}:${parts[1]}`;
      const data = await env.PAGES_KV.get(key);
      if (!data) return new Response("Not found", { status: 404 });
      return new Response(data, { headers: { "Content-Type": "application/json" } });
    }

    // ── Subdomain project-page renderer ───────────────────────────────────
    // Requests to {project}.futuremod.site/{pageId} are served as published
    // pages: we inject the Puck Data JSON into the HTML so the SPA can
    // render in view mode without a round-trip.
    const projectSlug = projectSlugFromHost(url.hostname);
    if (projectSlug && request.method === "GET" && !url.pathname.startsWith("/assets/")) {
      const pageId =
        url.pathname === "/" || url.pathname === ""
          ? "default"
          : url.pathname.slice(1).split("/")[0] || "default";

      const key = `${projectSlug}:${pageId}`;
      const pageData = await env.PAGES_KV.get(key);

      if (pageData) {
        const indexResponse = await env.ASSETS.fetch(
          new Request(new URL("/index.html", url).toString())
        );
        const html = await indexResponse.text();

        // Safely inject page data — escape </ to prevent script injection.
        const safe = pageData.replace(/</g, "\\u003c");
        const injected = html.replace(
          "</head>",
          `<script>window.__PAGE_DATA__=${safe};</script></head>`
        );

        return new Response(injected, {
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        });
      }

      // No published page for this slug — redirect to the main site.
      return Response.redirect("https://futuremod.site/", 302);
    }

    // ── Static SPA fallback ────────────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
