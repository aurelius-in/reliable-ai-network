-- Product reviews (moderated). Run in Supabase SQL editor.
-- Public reads go through service-role API only (no anon RLS policies).

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  company_name text not null default '',
  body text not null,
  display_body text,
  founder_response text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Safe if table already existed without these columns:
alter table public.product_reviews
  add column if not exists company_name text not null default '';

alter table public.product_reviews
  add column if not exists founder_response text;

create index if not exists product_reviews_status_created_idx
  on public.product_reviews (status, created_at desc);

create index if not exists product_reviews_ip_hash_idx
  on public.product_reviews (ip_hash);

alter table public.product_reviews enable row level security;

comment on table public.product_reviews is
  'Homepage product reviews; pending until founder approves.';
