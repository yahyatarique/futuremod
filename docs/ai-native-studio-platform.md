# AI-Native Studio & Platform — Product & Technical Notes

This document captures a detailed record of product direction, architecture, and constraints discussed for FutureMod Studio: a **Linktree-style, AI-native page builder** where people create dashboards or link hubs, get a **public URL** on a project subdomain, and use a **built-in chat** to shape their page—without needing to be programmers.

---

## 1. Audience and core constraint

**Primary users are not programmers.**

Implications for every surface (copy, flows, and error handling):

- The product should **never lead with JSON, schemas, or developer jargon**. The underlying page format may still be structured data (e.g. Puck layout JSON), but the UI presents **the page**: blocks, live preview, and simple actions.
- **Chat and help copy** should describe **outcomes** (“Add a link to your podcast,” “Make the top section brighter”) not implementation (“merge into `content[2].props`”).
- **Errors** should be plain-language and actionable; prefer **undo / restore** over stack traces or “invalid schema.”
- **Permissions** should read like human consent: e.g. “Allow the assistant to **publish** your page to your public link?” with options such as **this time only** / **not now**—not opaque OAuth scopes in the default path.

This document still uses technical terms where they help engineering; the **customer-facing** product should translate them away.

---

## 2. Product vision (high level)

### 2.1 What we are building

- A **Linktree-like** experience: one canonical **public link** per project (or per page within a project, depending on product rules), oriented around **blocks** (profile, links, socials, simple metrics, empty states, etc.).
- **AI-native Studio**: intelligence is **inside** the editor—especially a **native chat**—not only via external tools like Cursor MCP.
- Users can create **their own dashboards or pages** (not only rigid templates) within the capabilities of supported blocks.
- Each **project** can be viewed at a **predictable URL** on the product’s subdomain model (today: **`{project}.futuremod.site`**, with path segments for **page id** where applicable).

### 2.2 Public vs private layering

- **Editing** happens in the authenticated (or eventually authenticated) **Studio**.
- **Viewing** the published result is intended to be **read-only**, fast, and **shareable**—aligned with Linktree-style “this is my public page.”

---

## 3. Technical reality today (repository)

This section reflects the **FutureMod monorepo** as it stood when these notes were written: Vite/React Studio, Puck, Cloudflare Worker + KV + static assets.

### 3.1 Packages

- **`@futuremod/ui`** — React component library (buttons, cards, layout shells, tables, etc.).
- **`@futuremod/ai-context`** — Registry metadata: component names, prop definitions, generators for **`llms.txt`-style** context strings used by tooling and MCP.
- **`@futuremod/mcp-server`** — MCP server exposing that registry as **read-only tools** for external agents (e.g. Cursor).

### 3.2 Studio (`apps/studio`)

- **Page builder**: **Puck** (`@measured/puck`) with config in **`puck-config.tsx`**. Components are grouped into palettes (data, display, actions, layout) and mapped to **`@futuremod/ui`** plus data-bound wrappers (e.g. StatCard tied to queries).
- **Dashboard shell**: **`BrowserRouter`** in **`AppRoutes.tsx`** — **`/login`** & **`/signup`** (demo email/password accounts in `localStorage`, **`SessionContext`**), **`/dashboard`** (**project cards** backed by **`project-storage`**), **`/projects/:projectSlug/editor`**, **`/projects/:projectSlug/preview`** (read-only **`Render`**). Sidebar layout: **`DashboardLayout`** (`@futuremod/ui` Sidebar + **`PageLayout`**).
- **`main.tsx` branching**: (1) If **`window.__PAGE_DATA__`** — published view (**`Render`** only). (2) Else if **`isStandaloneProjectHost`** — **`StandaloneStudioApp`** (direct Puck, no dashboard; legacy `{project}.{root}` without KV data). (3) Else — **`AppRoutes`** (dashboard app on localhost / apex / non-project origins).
- **Project identity**: In the dashboard, **`projectSlug`** comes from **`useParams`** and **`project-storage`**. **Hostname-derived slug** remains for **`getProjectSlugFromLocation()`** standalone / KV publish keys. **`VITE_FUTUREMOD_PROJECT_SLUG`** still overrides slug in dev tools.
- **“User” today**: **`DataStudioContext`** `userId` is synced from **`SyncStudioUser`** to the signed-in account’s **`userId`** (**UUID**) when **`SessionProvider`** is mounted; **`useSession`** / **`signOut`** clear it back to **`local-user`**. Outside the dashboard (standalone subdomain editor), **`userId`** is still the raw dev string from **`localStorage`**. Replace all of this with real OAuth-backed ids.
- **Draft persistence**: Puck **`Data` JSON** in **`localStorage`** via **`persistence/puck-storage.ts`**, keyed **`futuremod-puck:${projectSlug}:${userId}:${pageId}`**. **Per-browser** until a drafts API exists.
- **Data studio (queries)**: In-memory / local configuration for sample sources and SQL-shaped query definitions; execution is stubbed for demos—**not** a production database connection.

### 3.3 Hosting and published pages (`apps/studio/src/worker.ts` + `wrangler.toml`)

- Deploy shape: **Cloudflare Worker** + **static assets** (SPA) + **KV** binding **`PAGES_KV`**.
- **Publish API**: `POST /api/publish` accepts `{ projectSlug, pageId, data }` and writes **`KV[key] = JSON.stringify(data)`** with key **`projectSlug:pageId`**.
- **Read API**: `GET /api/pages/:project/:page` returns the same JSON.
- **Public render path**: For requests on **`{project}.futuremod.site`** (non-reserved slug), the worker loads published data from KV and **injects** it into **`index.html`** as **`window.__PAGE_DATA__`** (with basic escaping of `<` to reduce script injection). The client then uses **Puck `Render`** in **view mode** (no editor chrome)—see **`main.tsx`** branch on `window.__PAGE_DATA__`.
- **Important security note**: As designed for early iteration, **`/api/publish` is not authenticated**. Anyone who can reach the endpoint could overwrite KV for a guessed `projectSlug:pageId`. **Production requires auth + ownership checks before any write.**

### 3.4 Reserved subdomain slugs

The worker treats certain host labels as non-project (**e.g.** `studio`, `www`, `api`, `local`) so they are not interpreted as customer project hosts. The apex domain (`futuremod.site`) resolves to project slug `"default"`, so its published pages are served at `default.futuremod.site`.

---

## 4. FutureMod MCP (Model Context Protocol)

### 4.1 Purpose

The MCP server **`@futuremod/mcp-server`** exists so **AI tooling** can query **`@futuremod/ai-context`** **without stuffing the entire registry into a system prompt**. It is **documentation and discovery for agents**, not a page runtime.

### 4.2 Exposed tools (read-only)

| Tool | Purpose |
|------|---------|
| `list_components` | Index: name, type, title, description, suggested import |
| `get_component` | Full spec for one component (props, variants, examples) |
| `search_components` | Keyword search over names/descriptions/types |
| `get_llms_txt` | Compact string for prompts |
| `get_llms_full_txt` | Full reference with prop tables and TSX snippets |

There is **no** MCP tool to create a routed page, push Puck state to KV, open Studio, or render a preview. **Connecting MCP to Studio** would require **new integration** (e.g. APIs the in-app agent calls)—it does not exist by default.

### 4.3 Relationship between MCP and Studio

- **Shared source of metadata**: **`@futuremod/ai-context`** feeds both MCP responses and Studio’s **`buildFields`** / registry alignment in **`puck-config.tsx`**.
- **No runtime wire**: Enabling MCP in Cursor does **not** connect Cursor to the deployed Studio or to a user’s draft. They are **parallel consumers** of the same component registry story.

### 4.4 What `get_llms_full_txt` contains (summary)

- Design positioning: cyan primary, red accent, Geist, dark/light, glass surfaces; Tailwind notes pointing at **`@futuremod/ui/styles`**.
- Per-component **`import`** lines, **`Props`** tables where defined, variant lists, and **copy-paste TSX examples** for: Button, Card, Badge, Input, Select, Avatar, Table, StatCard, Alert, Tabs, FormField, DashboardShell (+ `DashboardGrid`), Sidebar (+ nav patterns), PageLayout, EmptyState.
- Examples sometimes reference **Lucide** icons without including import lines—implementers add imports in real code.
- Doc nuance: e.g. **Card** `padding` default in the prop table vs. minimal examples—defaults should be verified in code when generating strict templates.

---

## 5. Direction: real auth, database, Google OAuth, media

### 5.1 Gaps in the current model

- **Identity**: `localStorage` `userId` is a stand-in.
- **Drafts**: Only **localStorage**; no multi-device sync or recovery.
- **Publish**: KV writes are **unauthenticated** from a product-security perspective.
- **Media**: No first-class blob storage or signed URLs yet; rich Linktree-style pages will need **images and files**.

### 5.2 Stack direction (aligned with existing Cloudflare deployment)

| Layer | Recommendation |
|-------|----------------|
| **Google OAuth** | Use a **server-side** OAuth flow (authorization code + **client secret** on the Worker or auth provider). The SPA alone should not be the only trust boundary for issuance. |
| **Auth packaging** | **Hosted** providers (Clerk, Auth0, WorkOS, Supabase Auth, etc.) speed time-to-market and reduce custom session bugs. **DIY** sessions in **D1** are possible but more engineering. |
| **Database** | **D1** (SQLite at the edge) fits next to the Worker; alternatively **Neon / PlanetScale / Supabase Postgres** if the team standardizes on Postgres. |
| **Published JSON** | Keep **KV** for low-latency reads and the current **HTML injection** pattern, **or** move canonical storage to DB/R2 with caching—either way, **authorize writes**. |
| **Media** | **R2** with **presigned upload URLs** issued by the Worker **after** auth; metadata (owner, mime, size, key) in **D1**; serve via signed GET or controlled public paths per asset policy. |

### 5.3 Suggested data model (sketch)

- **User** — from Google (`sub`, email, name, picture) plus internal id.
- **Project** — slug, display name, **owner**; enforce **unique slug** in DB before treating KV keys as stable public identifiers.
- **Page** — belongs to project; **draft** JSON vs **published** snapshot (or versioned rows).
- **Asset** (optional) — pointer to R2 object + ownership + quotas.

### 5.4 Suggested migration order

1. **Protect all write routes** (`/api/publish`, future draft APIs) with **auth + project ownership**.
2. Replace fake `userId` with **real sessions** and user records.
3. **Persist drafts** via API + DB; optionally keep localStorage as offline cache later.
4. Add **R2** when blocks need uploads (avatars, link thumbnails, etc.).

---

## 6. Native in-studio chat: AI helps build the page; user stays in control

### 6.1 Conceptual contract

- The **canonical document** remains **structured layout data** compatible with Puck ( **`Data`** ), possibly version-wrapped later for migrations.
- **Non-programmers** should experience this as **“the page”** and **assistant suggestions**, not raw JSON—though engineers may still log or debug JSON internally.
- **Draft vs publish**:
  - **Draft**: iterative changes while editing; safe to experiment.
  - **Publish**: explicit, **permissioned** action that updates what visitors see at the **project subdomain** (today: KV-backed published payload).

### 6.2 Agent interaction pattern (recommended)

- Prefer **structured tools** over one huge freeform JSON blob in chat: e.g. **read draft**, **propose patch**, **replace section**, **publish**—where **`publish` requires explicit user approval** in the UI (or a narrowly scoped, user-granted capability).
- Ground the model with **allowed block types and props** from **`puck-config` + `@futuremod/ai-context`** so the assistant does not invent unsupported components.
- **Validate on the server** before accepting draft or publish payloads: size limits, allowed component keys, depth limits, and sanitization for any user-supplied strings that could affect HTML or links.

### 6.3 Permissions (product language)

- Default stance: **the assistant never silently publishes.**
- Offer clear UI: **Preview changes → Apply to page → Publish to public link** (wording can stay non-technical).
- Log **who published, when, which project/page** for support and abuse review.

### 6.4 Operational concerns

- **Concurrency**: If the user edits manually while the model proposes changes, define rules (patch application vs last-write-wins) and surface conflicts plainly.
- **Streaming**: Avoid applying **partial** JSON; use patches or validated complete documents.
- **Abuse**: Rate limits on publish and assistant actions; quotas on storage and assets.

---

## 7. Linktree-shaped product primitives (conceptual)

These are UX/product building blocks—not all need separate Puck components day one:

- **Profile / identity** header (photo, bio, badges).
- **Ordered link list** (primary CTA styling, optional icons).
- **Social / platform** row.
- **Sections** or **tabs** for slightly richer “mini dashboard” feels.
- **Optional analytics** (later) for link clicks or views.
- **Theming** (colors, fonts) without exposing design tokens as “programmer concepts.”

The existing **`@futuremod/ui`** set (Card, Button, Badge, Avatar, EmptyState, etc.) can back many of these; Link-specific blocks may be added over time in **`puck-config`**.

---

## 8. Glossary (mixed audience)

| Term | Meaning |
|------|---------|
| **Puck `Data`** | JSON document describing the page layout and block props for the Puck editor/renderer. |
| **Project slug** | Short id derived from hostname (e.g. `myproject` in `myproject.futuremod.site`). |
| **Page id** | Named page within a project (e.g. `default` or custom id in path). |
| **Draft** | Editor state not yet—or no longer—the live public snapshot. |
| **Publish** | Push an approved snapshot so public visitors load it (today: KV key `projectSlug:pageId`). |
| **MCP** | Protocol for Cursor (and similar) to call small tools; FutureMod MCP exposes **read-only** component docs—not Studio control. |
| **`@futuremod/ai-context`** | Shared registry used by MCP and Studio metadata patterns. |

---

## 9. Open decisions (for future refinement)

- **Auth vendor vs custom** Worker OAuth + session store.
- **Canonical store** for published JSON (KV-only vs DB + cache).
- **Single public URL per project** vs multiple public pages with separate paths.
- **Templates** for “link hub” vs “metrics dashboard” and how much AI is allowed to restructure without explicit confirmation.
- **Internationalization** and accessibility baselines for generated layouts.

---

## Document history

- **Created** to consolidate a multi-turn discussion covering: MCP capabilities, Studio vs MCP boundaries, Linktree/AI-native direction, auth/DB/OAuth/media, in-studio chat and publish permissions, and **non-programmer-first** UX principles.
