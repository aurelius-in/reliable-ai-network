-- Shareable Monetization Briefs (public link via token). Run in Supabase SQL editor.



create table if not exists public.shared_reports (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users (id) on delete cascade,

  token text not null unique,

  title text not null,

  payload jsonb not null,

  created_at timestamptz not null default now(),

  revoked_at timestamptz

);



create index if not exists shared_reports_user_id_idx

  on public.shared_reports (user_id);



create index if not exists shared_reports_token_idx

  on public.shared_reports (token);



alter table public.shared_reports enable row level security;



drop policy if exists "Owners manage shared reports" on public.shared_reports;

create policy "Owners manage shared reports"

  on public.shared_reports

  for all

  using (auth.uid() = user_id)

  with check (auth.uid() = user_id);



comment on table public.shared_reports is 'Snapshot briefs shareable via /r/[token]; public read uses service role';

