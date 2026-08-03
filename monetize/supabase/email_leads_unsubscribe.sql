-- Add unsubscribe tracking for checkup / nurture emails.
-- Run in Supabase SQL Editor.

alter table public.email_leads
  add column if not exists unsubscribed_at timestamptz;

create index if not exists email_leads_unsubscribed_at_idx
  on public.email_leads (unsubscribed_at)
  where unsubscribed_at is not null;
