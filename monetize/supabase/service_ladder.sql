-- Service ladder (Phase 1–2) — run when ready; not required for Phase 0 messaging.
-- Principle: subscription = strategy/admin layer; DFY = optional execution.

-- ============================================================
-- roi_entries: user-logged economics (no fabricated ROI)
-- ============================================================
create table if not exists public.roi_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  creation_id uuid references public.creations (id) on delete set null,
  period_start date not null,
  period_end date not null,
  subscription_cost_usd numeric(12, 2) not null default 0,
  campaign_cost_usd numeric(12, 2) not null default 0,
  hours_spent numeric(8, 2) not null default 0,
  leads integer not null default 0,
  opportunities integer not null default 0,
  sales integer not null default 0,
  revenue_usd numeric(12, 2) not null default 0,
  estimated_hours_saved numeric(8, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roi_entries_user_id_idx on public.roi_entries (user_id);
create index if not exists roi_entries_creation_id_idx on public.roi_entries (creation_id);

alter table public.roi_entries enable row level security;

create policy "roi_entries_select_own"
  on public.roi_entries for select
  using (auth.uid() = user_id);

create policy "roi_entries_insert_own"
  on public.roi_entries for insert
  with check (auth.uid() = user_id);

create policy "roi_entries_update_own"
  on public.roi_entries for update
  using (auth.uid() = user_id);

create policy "roi_entries_delete_own"
  on public.roi_entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- execution_briefs: optional persisted Layer-2 handoff snapshot
-- (Phase 1 alternative: store brief_md inside generated_assets.content)
-- ============================================================
create table if not exists public.execution_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  creation_id uuid references public.creations (id) on delete set null,
  service_type text not null,
  brief_md text not null,
  source_asset_id uuid references public.generated_assets (id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'queued', 'in_progress', 'delivered', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists execution_briefs_user_id_idx on public.execution_briefs (user_id);

alter table public.execution_briefs enable row level security;

create policy "execution_briefs_select_own"
  on public.execution_briefs for select
  using (auth.uid() = user_id);

create policy "execution_briefs_insert_own"
  on public.execution_briefs for insert
  with check (auth.uid() = user_id);

create policy "execution_briefs_update_own"
  on public.execution_briefs for update
  using (auth.uid() = user_id);
