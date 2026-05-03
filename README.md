# FutureMod

> AI-native React component library. Tailwind + shadcn registry pattern. Cyan primary · Red accent · Geist font · Dark/light mode · Glassmorphic surfaces.

**FutureMod is free to use** — the component library, MCP server, and Studio ship as the real product, not a gated demo.

## Packages

- [@futuremod/ui](packages/ui) — React components
- [@futuremod/ai-context](packages/ai-context) — Registry metadata, llms.txt generator
- [@futuremod/mcp-server](packages/mcp-server) — MCP server for AI agents

## Quick start

```bash
pnpm add @futuremod/ui
import '@futuremod/ui/styles';
import { Button, Card, DashboardShell } from '@futuremod/ui';
```

## Develop in this repo

Use **Node 20+** and **pnpm 9** (this repo pins `packageManager: pnpm@9.0.0`). Enable pnpm once: `corepack prepare pnpm@9.0.0 --activate`.

Run **one command at a time** (paste each line separately). In zsh/bash, a comment must start a line with `#` or follow a space after the full command; if a whole block is pasted as a single line, text after `pnpm dev` can be passed as extra arguments. That makes `tsc` see `"#"` and the words `watch all packages` as source files and fail with `Option 'project' cannot be mixed with source files`.

```bash
cd /path/to/FutureMod
pnpm install
pnpm dev
```

```bash
pnpm build
pnpm --filter @futuremod/mcp-server start
```

`pnpm dev` runs TypeScript in watch mode for every package. `start` runs the MCP server on stdio (it waits for input; stop with Ctrl+C).

## FutureMod Studio (projects → pages → app canvas)

[apps/studio](apps/studio) is Vite + React. Structure:

- **Project** — `{project}.futuremod.site` for public URLs; routing uses **`/projects/:slug/...`** in the dashboard (`localhost` / apex). Projects are stored in Supabase Postgres (`projects` table) and scoped to the authenticated user.
- **Page** — named documents (`pageId`); Puck stores layout JSON keyed per project in browser `localStorage` (draft) and Cloudflare KV + Supabase (`pages` table) on publish.
- **Editor** — **Puck** with **@futuremod/ui** blocks and the **Data panel** (`DataPanel.tsx`) for project slug, page switching, and sample queries. The Puck **root** config wraps all blocks in a configurable centred container (max-width, padding) so the editor preview and the live published page look identical.
- **Dashboard & auth** — routes in [`AppRoutes.tsx`](apps/studio/src/routes/AppRoutes.tsx): `/login`, `/signup`, `/dashboard`, **`/projects/:slug/editor`**, **`/projects/:slug/preview`**. Auth is powered by **Supabase Auth** with email/password and **Google OAuth**.
- **Standalone editor** — visiting **`{project}.{root}`** without server-injected **`__PAGE_DATA__`** still mounts [`StandaloneStudioApp.tsx`](apps/studio/src/StandaloneStudioApp.tsx) (same Puck shell as the dashboard).

Also:

- **Data sources and queries** — sample datasets + SQL-shaped definitions; connect your API for live databases (credentials stay server-side).
- **Palette + [`placeFuturemodWidget`](apps/studio/src/ai/placement.ts)** — hooks for AI-driven composition.
- **In-app preview route** — **`/projects/:slug/preview`** renders read-only Puck (`Render`) with the same root container as the live page.

```bash
pnpm studio
```

Open [http://localhost:5173](http://localhost:5173) — sign in with Google or email/password, then pick or create a project.

### Authentication (Supabase Auth)

Studio uses **Supabase Auth** for all sign-in flows:

| Flow | Notes |
|------|-------|
| Email + password | Standard sign-up with optional email confirmation |
| Google OAuth | One-click sign-in; redirect back to `/dashboard` |

Configure in [`src/lib/supabase.ts`](apps/studio/src/lib/supabase.ts). Set the **Site URL** to `https://futuremod.site` and add `https://futuremod.site/**` to Redirect URLs in the Supabase Auth settings. For Google OAuth, register the Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`) as an authorised redirect in Google Cloud Console.

### Database (Supabase Postgres)

Project and page metadata live in Supabase Postgres. Run the migration before first use:

1. Open **[Supabase SQL editor](https://supabase.com/dashboard/project/_/sql/new)**
2. Paste and run [`supabase/migrations/20260504_init.sql`](supabase/migrations/20260504_init.sql)

**Schema:**

| Table | Key columns | Notes |
|-------|-------------|-------|
| `projects` | `user_id`, `slug`, `title` | One row per project; unique on `(user_id, slug)` |
| `pages` | `project_id`, `page_id`, `published_data jsonb`, `published_at` | Snapshot written on every Publish |

Row Level Security (RLS) is enabled on both tables — users can only read and write their own rows.

**Publish flow:** `POST /api/publish` (worker) writes the Puck data to **Cloudflare KV** (fast edge read) and also upserts a row in `pages` via the Supabase REST API. KV remains the authoritative source for serving live pages; the DB record is for dashboard listing and future querying.

### Hosting: one subdomain per project

Each **project** is served at **`{project}.futuremod.site`**. The studio reads the project slug from the hostname (see [`project-site.ts`](apps/studio/src/lib/project-site.ts)), shows it in the shell, and namespaces persistence keys with it. Visiting an unclaimed subdomain redirects to `futuremod.site`.

Deploy the same Studio build behind a wildcard DNS record (`*.futuremod.site`) and TLS for `*.futuremod.site`. Required env vars:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key |
| `VITE_FUTUREMOD_ROOT_DOMAIN` | Defaults to `futuremod.site` if unset |
| `VITE_FUTUREMOD_PROJECT_SLUG` | **Local only:** pretend to be a named project without DNS |

Worker vars (set in `wrangler.toml` or Cloudflare dashboard):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Same Supabase project URL |
| `SUPABASE_ANON_KEY` | Same anon key (used server-side to verify JWTs) |

### Deploy Studio (Wrangler, no GitHub Actions required)

Hosted Studio is a **Worker + static assets** app: [`apps/studio/wrangler.toml`](apps/studio/wrangler.toml) attaches **`futuremod.site`** and **`*.futuremod.site`**, and [`apps/studio/src/worker.ts`](apps/studio/src/worker.ts) runs on the edge. That only ships when **`wrangler deploy`** runs against **`apps/studio`**.

Uploading **`dist/`** by itself (classic **Pages "upload folder only"**) **does not** deploy **`worker.ts`** or **`[[routes]]`**, so custom domains won't behave like Studio.

**From your laptop (usual flow)**

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm deploy:studio
```

Equivalent: **`npx wrangler deploy --cwd apps/studio`** (see root [`package.json`](package.json)). Sign in once with **`npx wrangler login`**, or set **`CLOUDFLARE_API_TOKEN`** (Workers deploy permission, plus DNS/zone scopes if **`wrangler.toml`** uses **`zone_name`**) for non-interactive environments you control outside GitHub.

**Cloudflare dashboard + Git:** Connect the repo under **Workers & Pages** and set build/install commands so **`dist/`** exists, then **`wrangler deploy`** runs with `working directory` set to **`apps/studio`** (monorepo). After a successful **`wrangler deploy`**, **`wrangler.toml`** updates routes and Worker code.

SPA fallback uses `not_found_handling = "single-page-application"` in [`wrangler.toml`](apps/studio/wrangler.toml). Do **not** add a **`_redirects`** catch-all that loops ([error 10021](https://developers.cloudflare.com/workers/observability/errors/#validation-errors-10021)).

**Packages:** Studio bundles **`@futuremod/ui`** into **`apps/studio/dist`**; **`@futuremod/mcp-server`** is a separate Node MCP process, not this deploy.

## MCP

This repo includes **[`.cursor/mcp.json`](.cursor/mcp.json)** so Cursor loads **`@futuremod/mcp-server`** from the workspace via [`scripts/run-futuremod-mcp.cjs`](scripts/run-futuremod-mcp.cjs) (it builds **`packages/mcp-server`** once if **`dist/`** is missing). Restart Cursor after changes.

A **[`.mcp.json`](.mcp.json)** is also included for Supabase MCP — it points at the project's Supabase instance so AI agents can query the schema and debug the database directly.

Outside this workspace, once **`@futuremod/mcp-server`** is published, you can use:

```json
{
  "mcpServers": {
    "futuremod": { "type": "stdio", "command": "npx", "args": ["-y", "@futuremod/mcp-server"] }
  }
}
```

## Components

- Button, Card, Badge, Input, Select, Textarea, Avatar, Spinner
- Table, StatCard, Alert, Tabs, FormField, Label, Separator, Skeleton
- PageLayout, Sidebar, Header, DashboardShell, EmptyState

## Design Tokens

| Token          | Light              | Dark               |
|----------------|--------------------|--------------------|
| Primary (cyan) | hsl(189 94% 36%)   | hsl(189 94% 46%)   |
| Accent (red)   | hsl(0 84% 60%)     | hsl(0 84% 62%)     |
| Background     | hsl(0 0% 98%)      | hsl(220 14% 6%)    |
| Radius         | 10px               | 10px               |
