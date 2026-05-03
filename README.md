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

- **Project** — `{project}.futuremod.site` for public URLs; routing uses **`/projects/:slug/...`** in the dashboard (`localhost` / apex).
- **Page** — named documents (`userId` + `pageId`); Puck stores layout JSON keyed per project/account.
- **Editor** — **Puck** with **@futuremod/ui** blocks and the **Data panel** (`DataPanel.tsx`) for project slug, page switching, sample queries (see [`placement.ts`](apps/studio/src/ai/placement.ts) for programmatic placement helpers).
- **Dashboard & auth** — routes in [`AppRoutes.tsx`](apps/studio/src/routes/AppRoutes.tsx): `/login`, `/signup`, `/dashboard`, **`/projects/:slug/editor`**, **`/projects/:slug/preview`**. **Sign-up is demo-only** (browser `localStorage`); swap for OAuth + API when wired.
- **Standalone editor** — visiting **`{project}.{root}`** without server-injected **`__PAGE_DATA__`** still mounts [`StandaloneStudioApp.tsx`](apps/studio/src/StandaloneStudioApp.tsx) (same Puck shell as before dashboards).

Also:

- **Data sources and queries** — sample datasets + SQL-shaped definitions; connect your API for live databases (credentials stay server-side).
- **Palette + [`placeFuturemodWidget`](apps/studio/src/ai/placement.ts)** — hooks for AI-driven composition.
- **In-app preview route** — **`/projects/:slug/preview`** renders read-only Puck (`Render`) side-by-side workflow with the editor.

```bash
pnpm studio
```

Open [http://localhost:5173](http://localhost:5173) — **create an account** (demo) or sign in, then pick or create a project. For hosted SQL, expose a secure query API; keep secrets off the client.

### Hosting: one subdomain per project

Each **project** is intended to be served at **`{project}.futuremod.site`**. The studio reads the project slug from the hostname (see [`project-site.ts`](apps/studio/src/lib/project-site.ts)), shows it in the shell, and namespaces persistence keys with it. The apex domain (`futuremod.site` / `www`) is treated as non-project (“root”) until you redirect users to a project host.

Deploy the same Studio build behind a wildcard DNS record (`*.futuremod.site`) and TLS for `*.futuremod.site`. Optional env vars:

| Variable | Purpose |
|----------|---------|
| `VITE_FUTUREMOD_ROOT_DOMAIN` | Defaults to `futuremod.site` if unset. |
| `VITE_FUTUREMOD_PROJECT_SLUG` | **Local only:** pretend to be a named project without DNS. |
| `VITE_TLDRAW_LICENSE_KEY` | **Production:** [tldraw SDK](https://tldraw.dev/sdk-features/license-key) requires a key on HTTPS / non-localhost. Get a [trial](https://tldraw.dev/get-a-license/trial), [hobby](https://tldraw.dev/get-a-license/hobby), or commercial license; set at **build time** (Cloudflare dashboard build env vars, local shell, etc.). Safe to embed (domain-bound). |

### Deploy Studio (Wrangler, no GitHub Actions required)

Hosted Studio is a **Worker + static assets** app: [`apps/studio/wrangler.toml`](apps/studio/wrangler.toml) attaches **`futuremod.site`** and **`*.futuremod.site`**, and [`apps/studio/src/worker.ts`](apps/studio/src/worker.ts) runs on the edge. That only ships when **`wrangler deploy`** runs against **`apps/studio`**.

Uploading **`dist/`** by itself (classic **Pages “upload folder only”**) **does not** deploy **`worker.ts`** or **`[[routes]]`**, so custom domains won’t behave like Studio.

**From your laptop (usual flow)**

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm deploy:studio
```

Equivalent: **`npx wrangler deploy --cwd apps/studio`** (see root [`package.json`](package.json)). Sign in once with **`npx wrangler login`**, or set **`CLOUDFLARE_API_TOKEN`** (Workers deploy permission, plus DNS/zone scopes if **`wrangler.toml`** uses **`zone_name`**) for non-interactive environments you control outside GitHub.

**Cloudflare dashboard + Git:** You can skip GitHub Actions entirely. Connect the repo under **Workers & Pages** and set build/install commands so **`dist/`** exists, then **`wrangler deploy`** runs with **`working directory`/`cd`** set to **`apps/studio`** (monorepo). After a successful **`wrangler deploy`**, **`wrangler.toml`** updates routes and Worker code.

SPA fallback uses `not_found_handling = "single-page-application"` in [`wrangler.toml`](apps/studio/wrangler.toml). Do **not** add a **`_redirects`** catch‑all that loops ([error 10021](https://developers.cloudflare.com/workers/observability/errors/#validation-errors-10021)).

**Packages:** Studio bundles **`@futuremod/ui`** into **`apps/studio/dist`**; **`@futuremod/mcp-server`** is a separate Node MCP process, not this deploy.

## MCP

This repo includes **[`.cursor/mcp.json`](.cursor/mcp.json)** so Cursor loads **`@futuremod/mcp-server`** from the workspace via [`scripts/run-futuremod-mcp.cjs`](scripts/run-futuremod-mcp.cjs) (it builds **`packages/mcp-server`** once if **`dist/`** is missing). Restart Cursor after changes.

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

| Token       | Light              | Dark               |
|-------------|--------------------|--------------------|
| Primary (cyan) | hsl(189 94% 36%) | hsl(189 94% 46%) |
| Accent (red)  | hsl(0 84% 60%)   | hsl(0 84% 62%)   |
| Background   | hsl(0 0% 98%)    | hsl(220 14% 6%)  |
| Radius       | 10px              | 10px              |