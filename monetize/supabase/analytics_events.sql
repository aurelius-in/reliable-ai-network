-- Analytics events for founder Counter (/admin/counter)
-- Run in Supabase SQL editor on existing projects.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  session_id text,
  user_id uuid references public.profiles (id) on delete set null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
-- No public policies: inserts go through /api/track (service role).
-- Founder reads go through admin API (service role).

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_idx
  on public.analytics_events (name);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path);
create index if not exists analytics_events_session_id_idx
  on public.analytics_events (session_id);
