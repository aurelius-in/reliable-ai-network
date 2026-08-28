# RAIN Select

Separate acquisition brand at [rainselect.com](https://rainselect.com).

This is not a Make it RAIN tier. It is a selection funnel for a $1,500 30-Day Revenue Intervention.

## Local preview

- `/select`
- `/select?v=a&preview=1` through `v=d`

Preview traffic is marked and should be excluded from winner logic.

## Production host

Point `rainselect.com` at the same Next.js deploy as Make it RAIN. Middleware rewrites the Select host to `/select` so the visitor never sees Make it RAIN navigation.

## Database

Run `supabase/rain_select.sql` in the Supabase SQL editor before expecting applications to persist.

## Operator review

- `/admin/select-applications?key=`
- `/admin/select-funnel?key=`

Do not mark an applicant selected until a human reviews the business.

## Env

- `RAIN_SELECT_MONTHLY_PRICE` (default 1500)
- `RAIN_SELECT_SHOW_PRICE` (default true)
- `RAIN_SELECT_3X_GUARANTEE_ENABLED` (default false; do not use a 3X revenue promise)
- `RAIN_SELECT_MAX_ACTIVE_CLIENTS` (optional, only if capacity is real)

Work guarantee on the live page: if selected, name the highest-value leak and a next commercial move for the month, or refund the $1,500. That is a work-product guarantee, not a revenue multiple.

Make it RAIN in-app upsell (after the free brief) links here with `utm_source=makeitrain`. Keep Select chrome free of Make it RAIN navigation.
