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

- **Project** — `{project}.futuremod.site` (hostname slug).
- **Page** — named documents within a project (`userId` + `pageId`); each page has its own saved layout.
- **App canvas** — pan/zoom surface powered by **tldraw**; FutureMod blocks use a custom **`futuremod` shape** so **@futuremod/ui** renders **inside the canvas** (HTMLContainer), not only in a side preview. Legacy geo frames with metadata still get a small inspector. Drawing tools remain if you need markup.

Also:

- **Data sources and queries** — sample datasets + SQL-shaped definitions; connect your API for live databases (credentials stay server-side).
- **Palette + [`placeFuturemodWidget`](apps/studio/src/ai/placement.ts)** — same composition hooks for AI / MCP.
- **Live preview** when selecting a block on the app canvas (`@futuremod/ui`).

```bash
pnpm studio
```

Open [http://localhost:5173](http://localhost:5173). For hosted SQL, expose a secure query API; keep secrets off the client.

### Hosting: one subdomain per project

Each **project** is intended to be served at **`{project}.futuremod.site`**. The studio reads the project slug from the hostname (see [`project-site.ts`](apps/studio/src/lib/project-site.ts)), shows it in the shell, and namespaces persistence keys with it. The apex domain (`futuremod.site` / `www`) is treated as non-project (“root”) until you redirect users to a project host.

Deploy the same Studio build behind a wildcard DNS record (`*.futuremod.site`) and TLS for `*.futuremod.site`. Optional env vars:

| Variable | Purpose |
|----------|---------|
| `VITE_FUTUREMOD_ROOT_DOMAIN` | Defaults to `futuremod.site` if unset. |
| `VITE_FUTUREMOD_PROJECT_SLUG` | **Local only:** pretend to be a named project without DNS. |
| `VITE_TLDRAW_LICENSE_KEY` | **Production:** [tldraw SDK](https://tldraw.dev/sdk-features/license-key) requires a key on HTTPS / non-localhost. Get a [trial](https://tldraw.dev/get-a-license/trial), [hobby](https://tldraw.dev/get-a-license/hobby), or commercial license; set this at **build time** (GitHub secret or Cloudflare build env). Safe to embed (domain-bound). |

### CI & Cloudflare Workers (GitHub Actions)

Hosted Studio uses **Wrangler** so [`apps/studio/wrangler.toml`](apps/studio/wrangler.toml) routes (**`futuremod.site`** + **`*.futuremod.site`**) and [`apps/studio/src/worker.ts`](apps/studio/src/worker.ts) actually run on the edge. Uploading **`dist/`** alone (classic **Pages direct upload**) **does not** deploy that Worker or attach those domains.

Workflows in [`.github/workflows`](.github/workflows):

| Workflow | When |
|----------|------|
| `ci.yml` | Push / PR to `main` — `pnpm install --frozen-lockfile` + `pnpm build`. |
| `deploy-cloudflare-worker.yml` | Push to `main` or manual **workflow_dispatch** — **`wrangler deploy`** from `apps/studio` (= Worker + assets + routes). |

**One-time setup**

1. Ensure a **Workers** (or Workers + Assets) project exists whose name matches `name` in [`wrangler.toml`](apps/studio/wrangler.toml) (default **`futuremod-studio`**).
2. Create an API token able to deploy Workers **and** manage zone DNS/routes used by `wrangler.toml` (e.g. template **Edit Cloudflare Workers** plus **DNS** / **Zones** scopes for **`futuremod.site`**, or a broad **Administrator** token while iterating).
3. In GitHub → repo **Settings** → **Secrets and variables** → **Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — that token.
   - `CLOUDFLARE_ACCOUNT_ID` — Workers & Pages overview or account sidebar.
   - `VITE_TLDRAW_LICENSE_KEY` — **Secret** (recommended for production tldraw); see [tldraw license docs](https://tldraw.dev/sdk-features/license-key).

Optional **Variables**: `VITE_FUTUREMOD_ROOT_DOMAIN` (e.g. `futuremod.site`).

If the Cloudflare dashboard is also wired to **build from Git** for a **Pages**-only pipeline, disable that or aim it elsewhere so production traffic uses this **Wrangler** deploy (otherwise **`futuremod.site` can stay tied to static Pages** with no `worker.ts`).

**Manual deploy:**

```bash
npx wrangler deploy --cwd apps/studio
```

Same via **`pnpm deploy:studio`** after `pnpm install`.

SPA fallback uses `not_found_handling = "single-page-application"` in [`wrangler.toml`](apps/studio/wrangler.toml). Do **not** add a `_redirects` catch‑all that loops ([error 10021](https://developers.cloudflare.com/workers/observability/errors/#validation-errors-10021)).

**Packages:** Studio bundles `@futuremod/ui`; **`@futuremod/mcp-server`** is separate (Node MCP), not this deploy.

## MCP

```json
{
  "mcpServers": {
    "futuremod": { "command": "npx", "args": ["@futuremod/mcp-server"] }
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