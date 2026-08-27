-- RAIN Select applications. Service-role only. Run in Supabase SQL editor.

create table if not exists public.rain_select_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  last_name text,
  company_name text,
  company_url text,
  role text,
  revenue_range text,
  monthly_revenue_range text,
  employee_range text,
  sales_team_size text,
  pipeline_range text,
  average_deal_value_range text,
  customer_count_range text,
  sales_cycle text,
  crm text,
  marketing_spend_range text,
  suspected_constraint text,
  thirty_day_goal text,
  implementation_speed text,
  decision_authority text,
  variant text not null default 'a',
  anonymous_visitor_id text,
  session_id text,
  preview boolean not null default false,
  first_touch_source text,
  first_touch_medium text,
  first_touch_campaign text,
  first_touch_content text,
  first_touch_term text,
  first_referrer text,
  last_touch_source text,
  last_touch_medium text,
  last_touch_campaign text,
  landing_url text,
  application_status text not null default 'email_only',
  selection_status text not null default 'email_only',
  selection_reason text,
  decline_reason text,
  operator_notes text,
  proposed_constraint text,
  next_step_url text,
  price_presented integer,
  offer_accepted_at timestamptz,
  payment_status text,
  mir_referral_offered_at timestamptz,
  mir_referral_clicked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rain_select_applications_email_uidx
  on public.rain_select_applications (lower(email));

create index if not exists rain_select_applications_created_idx
  on public.rain_select_applications (created_at desc);

create index if not exists rain_select_applications_status_idx
  on public.rain_select_applications (selection_status);

alter table public.rain_select_applications enable row level security;
