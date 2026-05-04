-- When false, the project is only editable/viewable inside the logged-in dashboard (no live subdomain).
alter table public.projects
  add column if not exists public_on_web boolean not null default false;

comment on column public.projects.public_on_web is 'When true, published pages are served at {slug}.{root domain}. When false, subdomain/API stay closed.';
