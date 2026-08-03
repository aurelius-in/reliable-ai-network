-- Expert intake fields on creations. Run in Supabase SQL editor.

alter table public.creations
  add column if not exists stage text
    check (stage is null or stage in ('idea', 'building', 'beta', 'launched', 'revenue'));

alter table public.creations
  add column if not exists traction text;

alter table public.creations
  add column if not exists current_price text;

alter table public.creations
  add column if not exists competitors_notes text;

alter table public.creations
  add column if not exists evidence_docs jsonb not null default '[]'::jsonb;

alter table public.creations
  add column if not exists github_repo_url text;

alter table public.creations
  add column if not exists github_context jsonb;

alter table public.creations
  add column if not exists product_url text;

alter table public.creations
  add column if not exists website_context jsonb;

comment on column public.creations.stage is 'Commercial stage of the product';
comment on column public.creations.evidence_docs is 'Uploaded brief excerpts [{name, mime, text_excerpt, uploaded_at}]';
comment on column public.creations.github_context is 'Cached public GitHub summary for prompts';
comment on column public.creations.product_url is 'Public product / marketing site URL';
comment on column public.creations.website_context is 'Cached scrape: title, meta, text excerpt for audit prompts';
