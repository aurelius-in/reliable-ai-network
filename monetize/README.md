# RAIN Monetize — Make It Rain

The AI-powered monetization OS for AI creators. Next.js 15 (App Router) + Supabase (auth + Postgres) + Stripe (subscriptions with a 30-day Pro trial) + Grok (xAI) for the Idea Analyzer and Pricing Builder.

## Stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS 4**
- **Supabase** — email/password auth via `@supabase/ssr`, Postgres with RLS
- **Stripe** — subscription Checkout with `trial_period_days: 30` on the Pro plan, customer portal, webhook-driven state sync
- **Grok API (xAI)** — OpenAI-compatible chat completions with structured JSON output; prompts live in `prompts/`

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in every value (see below)
npm run dev
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, paste and run the entire contents of `supabase/schema.sql`. This creates `profiles`, `creations`, `generated_assets`, `billing_events`, and `progress_logs` with RLS, plus a trigger that auto-creates a profile row on signup.
3. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by the Stripe webhook)
4. In **Authentication → URL Configuration**, set the Site URL to your app URL and add `https://<your-app-domain>/auth/callback` to the redirect list. (For local dev: `http://localhost:3000/auth/callback`.)
   - Optional: disable "Confirm email" under Authentication → Providers → Email while testing, so signups log in immediately.

## 2. Stripe setup

1. In the [Stripe Dashboard](https://dashboard.stripe.com) (test mode first), create one product per tier, each with a **monthly recurring price**:
   - Starter — $20/mo → copy price ID into `STRIPE_PRICE_STARTER`
   - Growth — $50/mo → `STRIPE_PRICE_GROWTH`
   - Pro — $100/mo → `STRIPE_PRICE_PRO`
2. Copy your **secret key** into `STRIPE_SECRET_KEY` and publishable key into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Create a webhook endpoint pointing at `https://<your-app-domain>/api/stripe/webhook` with these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Enable the **customer portal** (Settings → Billing → Customer portal) and allow plan switches between the three prices plus cancellation, so upgrade/downgrade/cancel work from `/billing`.
5. Local webhook testing:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

**How the trial works:** checkout runs in subscription mode on the Pro price with `trial_period_days: 30` and `payment_method_collection: 'always'` — the card is collected upfront and charged automatically on day 31 unless the user cancels (one click from `/billing` via the portal).

## 3. Grok (xAI) setup

Create an API key at [console.x.ai](https://console.x.ai) → `GROK_API_KEY`. Optionally set `GROK_MODEL` (defaults to `grok-3`). Requests go to the OpenAI-compatible endpoint `https://api.x.ai/v1/chat/completions`.

## 4. Deploy to Vercel

1. Import the GitHub repo into Vercel and set **Root Directory** to `monetize`.
2. Add every variable from `.env.example` in Project → Settings → Environment Variables, with `NEXT_PUBLIC_APP_URL` set to the deployed URL (e.g. `https://MakeItRainApp.com`, no trailing slash).
3. Deploy, then point your Stripe webhook endpoint and Supabase redirect URLs at the deployed domain.
4. Verify the money path in Stripe test mode: sign up → onboarding analysis → start trial checkout (card `4242 4242 4242 4242`) → webhook sets `current_tier=pro`, `subscription_status=trialing`, `trial_ends_at` → `/billing` shows the trial banner → cancel via the portal. Then switch to live keys.

## Project structure

```
app/                 Pages (/, /signup, /login, /pricing, /onboarding, /dashboard, /billing)
app/api/analyze      Idea Analyzer (Grok, structured JSON)
app/api/pricing      Pricing & Packaging Builder (Grok)
app/api/stripe/*     checkout | portal | webhook
components/          UI components (nav, tabs, forms, result renderers)
lib/                 Supabase clients, Stripe helpers, Grok client, tiers, templates
prompts/             Prompt library (idea-analyzer, pricing-recommendations, offer-generator)
supabase/schema.sql  Full database schema with RLS + signup trigger
types/               Shared TypeScript types
```

## Notes

- Missing env vars never crash the build — all external clients are lazily initialized at request time.
- The Stripe webhook is the source of truth for `current_tier`, `subscription_status`, and `trial_ends_at`; it writes via the service-role client and logs every event to `billing_events` (idempotent on `stripe_event_id`).
- Growth/Pro tool tabs render as locked upsell cards linking to `/pricing`; their tooling ships in a later sprint.
