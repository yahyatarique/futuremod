-- ---------------------------------------------------------------------------
-- FutureMod: initial schema
-- ---------------------------------------------------------------------------

-- projects ----------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text not null,
  title       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint  projects_user_slug_unique unique (user_id, slug)
);

-- pages (stores published snapshots; draft stays in localStorage) ---------
create table if not exists public.pages (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  page_id         text not null,                    -- e.g. "default", "about"
  published_data  jsonb,                            -- last published Puck data
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint      pages_project_page_unique unique (project_id, page_id)
);

-- auto-update updated_at --------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.handle_updated_at();

-- Row Level Security -------------------------------------------------------
alter table public.projects enable row level security;
alter table public.pages    enable row level security;

-- Users can CRUD their own projects
create policy "projects: owner full access"
  on public.projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can CRUD pages that belong to their projects
create policy "pages: owner full access"
  on public.pages for all
  using  (exists (
    select 1 from public.projects p
    where p.id = pages.project_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = pages.project_id and p.user_id = auth.uid()
  ));
