-- Optional JSON blob for project-level SEO (title, OG tags, etc.)
alter table public.projects
  add column if not exists seo jsonb not null default '{}'::jsonb;

comment on column public.projects.seo is 'Optional SEO settings mirrored to edge KV on publish.';
