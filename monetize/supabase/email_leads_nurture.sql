-- Optional columns for 5-email nurture tracking.
-- Safe to run after email_leads.sql.

alter table public.email_leads
  add column if not exists nurture_enrolled_at timestamptz,
  add column if not exists nurture_emails jsonb default '[]'::jsonb;
