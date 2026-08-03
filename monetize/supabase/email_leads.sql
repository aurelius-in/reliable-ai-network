-- Email leads for the free Product Monetization Checkup.
-- Run in the Supabase SQL editor once.

create table if not exists public.email_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source text not null default 'homepage_checklist',
  checklist_sent_at timestamptz,
  followup_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email, source)
);

create index if not exists email_leads_created_at_idx
  on public.email_leads (created_at desc);

alter table public.email_leads enable row level security;
-- No public policies: service role only.
