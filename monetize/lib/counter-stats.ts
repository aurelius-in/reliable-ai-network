/**
 * Aggregate founder Counter stats from profiles + analytics_events.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type CounterRow = {
  id: string;
  email: string;
  name: string | null;
  subscription_status: string | null;
  current_tier: string | null;
  trial_ends_at: string | null;
  created_at: string | null;
};

export type FunnelStep = {
  key: string;
  label: string;
  count: number;
  /** Drop from previous step (0-100). null for first. */
  dropPct: number | null;
};

export type CounterStats = {
  checkedAt: string;
  accounts: {
    total: number;
    last24Hours: number;
    last7Days: number;
    trialing: number;
    canceled: number;
    active: number;
  };
  recent: CounterRow[];
  window: "7d";
  sessions: number;
  pageViews: number;
  pages: { path: string; views: number; sessions: number }[];
  events: { name: string; count: number }[];
  funnel: FunnelStep[];
  sources: { source: string; sessions: number }[];
  bottlenecks: string[];
  trackingReady: boolean;
  trackingError?: string;
};

type EventRow = {
  name: string;
  path: string | null;
  session_id: string | null;
  utm_source: string | null;
  created_at: string;
};

function uniqueSessions(rows: EventRow[]): number {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.session_id) set.add(r.session_id);
  }
  return set.size || rows.length;
}

function sessionsFor(
  rows: EventRow[],
  pred: (r: EventRow) => boolean
): number {
  const set = new Set<string>();
  let fallback = 0;
  for (const r of rows) {
    if (!pred(r)) continue;
    if (r.session_id) set.add(r.session_id);
    else fallback += 1;
  }
  return set.size || fallback;
}

function pathBase(path: string | null): string {
  if (!path) return "/";
  const bare = path.split("?")[0] || "/";
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
}

function buildFunnel(rows: EventRow[]): FunnelStep[] {
  const steps: { key: string; label: string; pred: (r: EventRow) => boolean }[] =
    [
      {
        key: "home",
        label: "Home",
        pred: (r) =>
          r.name === "page_view" && pathBase(r.path) === "/",
      },
      {
        key: "pricing",
        label: "Pricing",
        pred: (r) =>
          r.name === "page_view" && pathBase(r.path) === "/pricing",
      },
      {
        key: "signup",
        label: "Signup page",
        pred: (r) =>
          r.name === "page_view" && pathBase(r.path) === "/signup",
      },
      {
        key: "signup_submit",
        label: "Started signup",
        pred: (r) => r.name === "signup_submit",
      },
      {
        key: "login",
        label: "Login page",
        pred: (r) =>
          r.name === "page_view" && pathBase(r.path) === "/login",
      },
      {
        key: "login_success",
        label: "Logged in",
        pred: (r) => r.name === "login_success",
      },
      {
        key: "dashboard",
        label: "Dashboard",
        pred: (r) =>
          r.name === "page_view" && pathBase(r.path).startsWith("/dashboard"),
      },
      {
        key: "billing",
        label: "Billing / manage trial",
        pred: (r) =>
          (r.name === "page_view" && pathBase(r.path) === "/billing") ||
          r.name === "manage_trial_click" ||
          r.name === "billing_portal_open",
      },
    ];

  const counts = steps.map((s) => sessionsFor(rows, s.pred));
  return steps.map((s, i) => {
    const count = counts[i];
    const prev = i === 0 ? null : counts[i - 1];
    const dropPct =
      prev === null || prev === 0
        ? null
        : Math.round(((prev - count) / prev) * 100);
    return { key: s.key, label: s.label, count, dropPct };
  });
}

function buildBottlenecks(
  funnel: FunnelStep[],
  events: { name: string; count: number }[],
  accounts: CounterStats["accounts"]
): string[] {
  const tips: string[] = [];
  const byKey = Object.fromEntries(funnel.map((f) => [f.key, f]));

  if (byKey.home?.count === 0 && accounts.last7Days === 0) {
    tips.push(
      "Almost no measured home traffic in 7 days — people may not be clicking your links, or tracking isn’t live yet."
    );
  }

  if (
    byKey.home &&
    byKey.pricing &&
    byKey.home.count > 5 &&
    byKey.pricing.count / byKey.home.count < 0.2
  ) {
    tips.push(
      `Home → Pricing drop is steep (${byKey.pricing.dropPct ?? "?"}% leave). Home CTA or offer may not be landing.`
    );
  }

  if (
    byKey.pricing &&
    byKey.signup &&
    byKey.pricing.count > 3 &&
    byKey.signup.count / byKey.pricing.count < 0.35
  ) {
    tips.push(
      "Many see Pricing but few open Signup — price, copy, or trust on that page may be the scare-off."
    );
  }

  const loginErrors =
    events.find((e) => e.name === "login_error")?.count ?? 0;
  const loginSuccess =
    events.find((e) => e.name === "login_success")?.count ?? 0;
  if (loginErrors > 0 && loginErrors >= loginSuccess) {
    tips.push(
      `Login errors (${loginErrors}) are high vs successes (${loginSuccess}) — auth friction is a bottleneck.`
    );
  }

  const checkoutCanceled =
    events.find((e) => e.name === "checkout_canceled")?.count ?? 0;
  if (checkoutCanceled > 0) {
    tips.push(
      `${checkoutCanceled} checkout cancel(s) in this window — people start Stripe then bail (price, card, or cold feet).`
    );
  }

  const manageTrial =
    events.find((e) => e.name === "manage_trial_click")?.count ?? 0;
  const portal =
    events.find((e) => e.name === "billing_portal_open")?.count ?? 0;
  if (manageTrial + portal > 0 && accounts.canceled > 0) {
    tips.push(
      `${manageTrial + portal} manage-trial / portal opens and ${accounts.canceled} canceled account(s) — watch for early churn.`
    );
  }

  const installShown =
    events.find((e) => e.name === "install_prompt_shown")?.count ?? 0;
  const installAccepted =
    events.find((e) => e.name === "install_accepted")?.count ?? 0;
  if (installShown > 2 && installAccepted === 0) {
    tips.push(
      "Install prompt is showing but nobody accepted — PWA install isn’t converting yet."
    );
  }

  if (tips.length === 0) {
    tips.push(
      "Not enough drop-off signal yet. Keep driving traffic with UTM links (?utm_source=linkedin&utm_medium=dm)."
    );
  }

  return tips.slice(0, 5);
}

export async function loadCounterStats(): Promise<
  CounterStats | { error: string }
> {
  try {
    const admin = createAdminClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: total, error: totalError },
      { count: last7Days, error: weekError },
      { count: last24Hours, error: dayError },
      { count: trialing, error: trialError },
      { count: canceled, error: canceledError },
      { count: active, error: activeError },
      { data: recent, error: recentError },
      eventsRes,
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trialing"),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "canceled"),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active"),
      admin
        .from("profiles")
        .select(
          "id, email, name, subscription_status, current_tier, trial_ends_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(25),
      admin
        .from("analytics_events")
        .select("name, path, session_id, utm_source, created_at")
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: false })
        .limit(8000),
    ]);

    const profileError =
      totalError ||
      weekError ||
      dayError ||
      trialError ||
      canceledError ||
      activeError ||
      recentError;
    if (profileError) return { error: profileError.message };

    const accounts = {
      total: total ?? 0,
      last7Days: last7Days ?? 0,
      last24Hours: last24Hours ?? 0,
      trialing: trialing ?? 0,
      canceled: canceled ?? 0,
      active: active ?? 0,
    };

    let trackingReady = true;
    let trackingError: string | undefined;
    let rows: EventRow[] = [];

    if (eventsRes.error) {
      trackingReady = false;
      trackingError = eventsRes.error.message;
    } else {
      rows = (eventsRes.data ?? []) as EventRow[];
    }

    const pageViewRows = rows.filter((r) => r.name === "page_view");
    const pageMap = new Map<string, { views: number; sessions: Set<string> }>();
    for (const r of pageViewRows) {
      const p = pathBase(r.path);
      const cur = pageMap.get(p) ?? { views: 0, sessions: new Set() };
      cur.views += 1;
      if (r.session_id) cur.sessions.add(r.session_id);
      pageMap.set(p, cur);
    }
    const pages = [...pageMap.entries()]
      .map(([path, v]) => ({
        path,
        views: v.views,
        sessions: v.sessions.size || v.views,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    const eventMap = new Map<string, number>();
    for (const r of rows) {
      if (r.name === "page_view") continue;
      eventMap.set(r.name, (eventMap.get(r.name) ?? 0) + 1);
    }
    const events = [...eventMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const sourceMap = new Map<string, Set<string>>();
    for (const r of rows) {
      const src = r.utm_source?.trim() || "(none / direct)";
      const set = sourceMap.get(src) ?? new Set();
      if (r.session_id) set.add(r.session_id);
      else set.add(`anon_${set.size}`);
      sourceMap.set(src, set);
    }
    const sources = [...sourceMap.entries()]
      .map(([source, set]) => ({ source, sessions: set.size }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    const funnel = trackingReady ? buildFunnel(rows) : [];
    const bottlenecks = trackingReady
      ? buildBottlenecks(funnel, events, accounts)
      : [
          trackingError?.includes("does not exist")
            ? "Run supabase/analytics_events.sql in the Supabase SQL editor to turn on activity tracking."
            : `Activity tracking unavailable: ${trackingError ?? "unknown error"}`,
        ];

    return {
      checkedAt: new Date().toISOString(),
      accounts,
      recent: (recent ?? []) as CounterRow[],
      window: "7d",
      sessions: uniqueSessions(rows),
      pageViews: pageViewRows.length,
      pages,
      events,
      funnel,
      sources,
      bottlenecks,
      trackingReady,
      trackingError,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to load counter",
    };
  }
}
