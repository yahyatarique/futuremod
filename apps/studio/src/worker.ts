interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Env {
  PAGES_KV: KVNamespace;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface PublishBody {
  projectSlug: string;
  pageId: string;
  data: unknown;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // POST /api/publish  — save page JSON to KV
    if (url.pathname === "/api/publish" && request.method === "POST") {
      const body = (await request.json()) as PublishBody;
      if (!body.projectSlug || !body.pageId || !body.data) {
        return Response.json({ error: "Missing projectSlug, pageId, or data" }, { status: 400 });
      }
      const key = `${body.projectSlug}:${body.pageId}`;
      await env.PAGES_KV.put(key, JSON.stringify(body.data));
      return Response.json({ ok: true, key });
    }

    // GET /api/pages/:projectSlug/:pageId  — read page JSON from KV
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

    // Everything else → static SPA assets
    return env.ASSETS.fetch(request);
  },
};
