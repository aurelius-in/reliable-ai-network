-- Referral program
-- Run in Supabase SQL Editor after schema.sql.
-- App rules: 50% of referee's first paid invoice (post-trial) as Stripe credit; stacks; no cap.

-- ============================================================
-- profiles: referral identity + attribution
-- ============================================================
alter table public.profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

create unique index if not exists profiles_referral_code_uidx
  on public.profiles (referral_code)
  where referral_code is not null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

-- Backfill codes for existing users
update public.profiles
set referral_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
where referral_code is null;

-- New signups get a code automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============================================================
-- referral_rewards: audit of paid credits (service role writes)
-- ============================================================
create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referee_id uuid not null references public.profiles (id) on delete cascade,
  stripe_invoice_id text unique,
  credit_cents integer not null,
  status text not null check (status in ('credited', 'skipped_cap', 'skipped_no_customer', 'skipped_self')),
  created_at timestamptz not null default now(),
  constraint referral_rewards_referee_unique unique (referee_id)
);

alter table public.referral_rewards enable row level security;

create policy "Users can view own referral rewards as referrer"
  on public.referral_rewards for select
  using (auth.uid() = referrer_id);

create index if not exists referral_rewards_referrer_id_idx
  on public.referral_rewards (referrer_id);
