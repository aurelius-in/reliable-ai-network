-- RAIN Monetize — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.

-- ============================================================
-- profiles: one row per auth user, synced with Stripe state
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  stripe_customer_id text unique,
  current_tier text check (current_tier in ('starter', 'growth', 'pro')),
  trial_ends_at timestamptz,
  subscription_status text, -- trialing | active | past_due | canceled | incomplete | unpaid
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- creations: the user's AI products
-- ============================================================
create table if not exists public.creations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  type text not null default 'other', -- app | game | tool | saas | content | other
  created_at timestamptz not null default now()
);

alter table public.creations enable row level security;

create policy "Users can view own creations"
  on public.creations for select
  using (auth.uid() = user_id);

create policy "Users can insert own creations"
  on public.creations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own creations"
  on public.creations for update
  using (auth.uid() = user_id);

create policy "Users can delete own creations"
  on public.creations for delete
  using (auth.uid() = user_id);

-- ============================================================
-- generated_assets: AI outputs (analysis, pricing, offers, ...)
-- ============================================================
create table if not exists public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  creation_id uuid references public.creations (id) on delete cascade,
  type text not null, -- idea_analysis | pricing | offer | funnel | copy
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.generated_assets enable row level security;

create policy "Users can view own assets"
  on public.generated_assets for select
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on public.generated_assets for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own assets"
  on public.generated_assets for delete
  using (auth.uid() = user_id);

-- ============================================================
-- billing_events: audit log written by the Stripe webhook
-- (service role only — no user-facing policies beyond select)
-- ============================================================
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  stripe_event_id text unique,
  type text,
  amount integer, -- cents
  status text,
  created_at timestamptz not null default now()
);

alter table public.billing_events enable row level security;

create policy "Users can view own billing events"
  on public.billing_events for select
  using (auth.uid() = user_id);

-- ============================================================
-- progress_logs: milestone tracker
-- ============================================================
create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  milestone text not null,
  completed boolean not null default false,
  date timestamptz not null default now(),
  -- One row per user per milestone; the app upserts on (user_id, milestone).
  constraint progress_logs_user_milestone_key unique (user_id, milestone)
);

alter table public.progress_logs enable row level security;

create policy "Users can view own progress"
  on public.progress_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.progress_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.progress_logs for update
  using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create a profile row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpful indexes
create index if not exists creations_user_id_idx on public.creations (user_id);
create index if not exists generated_assets_user_id_idx on public.generated_assets (user_id);
create index if not exists generated_assets_creation_id_idx on public.generated_assets (creation_id);
create index if not exists billing_events_user_id_idx on public.billing_events (user_id);
create index if not exists progress_logs_user_id_idx on public.progress_logs (user_id);

-- ============================================================
-- analytics_events: first-party funnel / page activity (Counter)
-- Inserts via /api/track (service role). No public RLS policies.
-- Also see supabase/analytics_events.sql for standalone migrate.
-- ============================================================
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

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_idx
  on public.analytics_events (name);
create index if not exists analytics_events_path_idx
  on public.analytics_events (path);
create index if not exists analytics_events_session_id_idx
  on public.analytics_events (session_id);

-- ============================================================
-- MIGRATION for EXISTING databases (created before the 9-tab
-- dashboard update). New projects running this whole file are
-- already covered — run this block ONLY on an existing database.
-- ============================================================
-- The Progress Tracker upserts milestones on (user_id, milestone),
-- which requires this unique constraint:
--
--   -- Remove any duplicate milestone rows first (keeps the newest):
--   delete from public.progress_logs a
--   using public.progress_logs b
--   where a.user_id = b.user_id
--     and a.milestone = b.milestone
--     and a.date < b.date;
--
--   alter table public.progress_logs
--     add constraint progress_logs_user_milestone_key
--     unique (user_id, milestone);
--
-- No other schema changes are needed: the new tools (funnel,
-- content bundles, strategy reports, done-for-you requests) reuse
-- generated_assets with new `type` values ('funnel', 'content_bundle',
-- 'strategy_competitors', 'strategy_pricing_optimization',
-- 'strategy_roadmap', 'strategy_ab_tests', 'dfy_request').
