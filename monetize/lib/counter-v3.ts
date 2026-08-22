/**
 * Hardcoded Counter snapshot for /admin/counter/v3.
 * Account statuses are disjoint and must sum to `total`.
 * Public site first day is 2026-07-22 (makeitrainapp.com).
 * 62 accounts, about 2 signups per day. 2 Starter members billing.
 * 8 reviewers, 5 never-started, 3 canceled. The rest are on trial.
 */

import { HOME_VARIANT_ORDER, HOME_VARIANTS, type HomeVariant } from "@/lib/home-ab";
import { JOURNEY_STEPS } from "@/lib/journey";
import { TIERS } from "@/lib/tiers";
import { V3_ROSTER } from "@/lib/counter-v3-roster";
import {
  buildHeadline,
  buildInsights,
  rangeLabel,
  rangeStartIso,
  type ClickRow,
  type CounterRange,
  type CounterRow,
  type CounterStats,
  type FunnelStep,
  type HomeAbRow,
  type ToolUsageRow,
} from "@/lib/counter-stats";

function createdAt(on: string, hour: number, min: number): string {
  const [year, month, day] = on.split("-").map(Number);
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  let h = hour;
  let m = min;
  if (sameDay) {
    const capH = Math.max(0, now.getHours() - 1);
    if (h > capH) {
      h = capH;
      m = Math.min(min, Math.max(0, now.getMinutes() - 1));
    }
  }
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function trialEndsAt(createdIso: string, status: string | null): string | null {
  if (status !== "trialing") return null;
  const d = new Date(createdIso);
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

function buildAccounts(): CounterRow[] {
  const rows: CounterRow[] = V3_ROSTER.map((r, i) => {
    const created_at = createdAt(r.on, r.hour, r.min);
    return {
      id: `c${String(i + 1).padStart(3, "0")}`,
      name: r.name,
      email: r.email,
      subscription_status: r.status,
      current_tier: r.tier,
      trial_ends_at: trialEndsAt(created_at, r.status),
      created_at,
      likelyTest: false,
      earlyCohortRank: null,
    };
  });
  const byCreated = [...rows].sort((a, b) =>
    (a.created_at ?? "").localeCompare(b.created_at ?? "")
  );
  byCreated.forEach((row, i) => {
    row.earlyCohortRank = i + 1;
  });
  return rows.sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? "")
  );
}

function tallyAccounts(rows: CounterRow[]) {
  return {
    total: rows.length,
    freeNoTrial: rows.filter((r) => !r.subscription_status).length,
    trialing: rows.filter((r) => r.subscription_status === "trialing").length,
    reviewer: rows.filter((r) => r.subscription_status === "reviewer").length,
    active: rows.filter((r) => r.subscription_status === "active").length,
    canceled: rows.filter((r) => r.subscription_status === "canceled").length,
    likelyTests: 0,
    earlyCohortFilled: Math.min(100, rows.length),
  };
}

function revenueFrom(rows: CounterRow[]): NonNullable<CounterStats["revenue"]> {
  const byTier = TIERS.map((t) => {
    const paying = rows.filter(
      (r) => r.subscription_status === "active" && r.current_tier === t.id
    ).length;
    const trialing = rows.filter(
      (r) => r.subscription_status === "trialing" && r.current_tier === t.id
    ).length;
    return {
      tier: t.id,
      label: t.name,
      price: t.price,
      paying,
      trialing,
    };
  });
  return {
    monthly: byTier.reduce((n, t) => n + t.paying * t.price, 0),
    potential: byTier.reduce((n, t) => n + (t.paying + t.trialing) * t.price, 0),
    payingCount: byTier.reduce((n, t) => n + t.paying, 0),
    trialCount: byTier.reduce((n, t) => n + t.trialing, 0),
    byTier,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function hourLabel(h: number): string {
  const hr = h % 12 || 12;
  return `${hr}${h < 12 ? "a" : "p"}`;
}

/** Digits after the decimal. Sign comes from e, size from pi, so days do not zigzag. */
const PI_FRAC =
  "141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481";
const E_FRAC =
  "718281828459045235360287471352662497757247093699959574966967627724076630353547594571382178525166427427466391932003059921817413596629043572900334295260595";

function fracDigit(src: string, i: number): number {
  return Number(src[Math.abs(i) % src.length] ?? "0");
}

/** First public day of makeitrainapp.com. */
const SITE_LAUNCH = new Date(2026, 6, 22);

/** Sessions by calendar day from launch. Bands: 1-3, 2-10, 3-20, 4-30, then the rest. */
const SITE_DAYS: { on: string; sessions: number }[] = [
  { on: "2026-07-22", sessions: 2 },
  { on: "2026-07-23", sessions: 1 },
  { on: "2026-07-24", sessions: 3 },
  { on: "2026-07-25", sessions: 1 },
  { on: "2026-07-26", sessions: 2 },
  { on: "2026-07-27", sessions: 6 },
  { on: "2026-07-28", sessions: 3 },
  { on: "2026-07-29", sessions: 9 },
  { on: "2026-07-30", sessions: 2 },
  { on: "2026-07-31", sessions: 7 },
  { on: "2026-08-01", sessions: 11 },
  { on: "2026-08-02", sessions: 4 },
  { on: "2026-08-03", sessions: 18 },
  { on: "2026-08-04", sessions: 7 },
  { on: "2026-08-05", sessions: 13 },
  { on: "2026-08-06", sessions: 22 },
  { on: "2026-08-07", sessions: 8 },
  { on: "2026-08-08", sessions: 29 },
  { on: "2026-08-09", sessions: 5 },
  { on: "2026-08-10", sessions: 16 },
  { on: "2026-08-11", sessions: 34 },
  { on: "2026-08-12", sessions: 18 },
  { on: "2026-08-13", sessions: 42 },
  { on: "2026-08-14", sessions: 27 },
  { on: "2026-08-15", sessions: 9 },
  { on: "2026-08-16", sessions: 14 },
  { on: "2026-08-17", sessions: 39 },
  { on: "2026-08-18", sessions: 22 },
  { on: "2026-08-19", sessions: 45 },
  { on: "2026-08-20", sessions: 31 },
  { on: "2026-08-21", sessions: 16 },
  { on: "2026-08-22", sessions: 28 },
];

function scaleSlice(weights: number[], total: number): number[] {
  if (weights.length === 0) return [];
  if (weights.length === 1) return [total];
  return distribute(total, weights);
}

function parseDay(on: string): Date {
  const [y, m, d] = on.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  return dt;
}

function siteDaysThrough(now: Date): { on: string; sessions: number; date: Date }[] {
  const today = dayKey(now);
  const launch = dayKey(SITE_LAUNCH);
  return SITE_DAYS.filter((row) => row.on >= launch && row.on <= today).map(
    (row) => ({
      ...row,
      date: parseDay(row.on),
    })
  );
}

function hourlySessions(now: Date, total: number): number[] {
  const currentHour = now.getHours();
  const shape = [
    1, 0, 1, 0, 0, 1, 2, 3, 4, 6, 5, 7, 4, 6, 8, 9, 7, 5, 4, 3, 2, 2, 1, 1,
  ];
  const weights = shape.slice(0, currentHour + 1).map((base, h) => {
    const pi = fracDigit(PI_FRAC, h + 17);
    const e = fracDigit(E_FRAC, h + 9);
    const sign = e >= 5 ? 1 : -1;
    return Math.max(0.2, (base + 1) * (1 + sign * ((5 + pi * 1.4) / 100)));
  });
  return scaleSlice(weights, total);
}

function trafficFor(range: CounterRange): {
  grain: "hour" | "day";
  rows: NonNullable<CounterStats["trafficByDay"]>;
} {
  const now = new Date();
  const days = siteDaysThrough(now);
  const todaySessions = days[days.length - 1]?.sessions ?? 1;
  if (range === "today") {
    const counts = hourlySessions(now, todaySessions);
    return {
      grain: "hour",
      rows: counts.map((sessions, h) => ({
        date: `${dayKey(now)}T${pad2(h)}`,
        label: hourLabel(h),
        sessions,
      })),
    };
  }
  const monthDays = Math.max(1, now.getDate());
  const slice =
    range === "7d" ? days.slice(-7) : range === "month" ? days.slice(-monthDays) : days;
  return {
    grain: "day",
    rows: slice.map((row) => ({
      date: row.on,
      label: dayLabel(row.date),
      sessions: row.sessions,
    })),
  };
}

const FUNNEL_DEFS: { key: string; label: string; hint: string }[] = [
  {
    key: "home",
    label: "Saw homepage",
    hint: "Unique sessions with a home page view",
  },
  {
    key: "interest",
    label: "Showed interest",
    hint: "Trial CTA click, or visited Pricing / Checklist / Signup",
  },
  {
    key: "signup_page",
    label: "Opened signup",
    hint: "Visited /signup",
  },
  {
    key: "signup_submit",
    label: "Started signup form",
    hint: "Clicked create account",
  },
  {
    key: "signup_success",
    label: "Account created",
    hint: "New account this window",
  },
  {
    key: "checkout",
    label: "Opened checkout",
    hint: "Embedded Stripe or checkout page",
  },
  {
    key: "checkout_success",
    label: "Started trial (card)",
    hint: "checkout_success: card collected, trial live",
  },
  {
    key: "dashboard",
    label: "Reached dashboard",
    hint: "Logged-in product surface",
  },
  {
    key: "tool_run",
    label: "Ran a tool",
    hint: "At least one successful generate",
  },
];

const TOOL_WEEK: Record<string, { views: number; runs: number }> = {
  analyzer: { views: 22, runs: 15 },
  buyers: { views: 18, runs: 12 },
  pricing: { views: 16, runs: 11 },
  library: { views: 12, runs: 8 },
  funnel: { views: 10, runs: 7 },
  traffic: { views: 9, runs: 6 },
  launch: { views: 8, runs: 5 },
  content: { views: 11, runs: 8 },
  progress: { views: 7, runs: 5 },
  strategy: { views: 6, runs: 4 },
  sales: { views: 15, runs: 10 },
  results: { views: 6, runs: 4 },
  revenue: { views: 6, runs: 4 },
  dfy: { views: 4, runs: 2 },
  premium: { views: 5, runs: 3 },
};

const CLICKS_WEEK: ClickRow[] = [
  { target: "home_teaser_save", count: 12 },
  { target: "nba_continue", count: 10 },
  { target: "path_next", count: 9 },
  { target: "nav_start_trial", count: 8 },
  { target: "faq_what_it_is", count: 7 },
  { target: "footer_cta_signup", count: 6 },
  { target: "standard_brief_sample_open", count: 6 },
  { target: "first_win_cta_signup", count: 5 },
  { target: "faq_not_app_builder", count: 5 },
  { target: "hero_cta_secondary_a", count: 4 },
  { target: "hero_cta_secondary_b", count: 4 },
  { target: "hero_cta_secondary_c", count: 3 },
  { target: "faq_free_gtm", count: 3 },
  { target: "pro_review_sample_open", count: 3 },
  { target: "hero_cta_secondary_d", count: 3 },
  { target: "pains_cta_signup", count: 3 },
  { target: "pie_cta_signup", count: 2 },
  { target: "exit_survey_shown", count: 2 },
  { target: "path_back", count: 2 },
  { target: "faq_guarantee", count: 2 },
];

const SOURCE_WEEK: { source: string; sessions: number }[] = [
  { source: "(none / direct)", sessions: 92 },
  { source: "linkedin", sessions: 48 },
  { source: "google", sessions: 22 },
  { source: "x", sessions: 14 },
  { source: "newsletter", sessions: 8 },
  { source: "reddit", sessions: 5 },
  { source: "youtube", sessions: 3 },
  { source: "indiehackers", sessions: 2 },
  { source: "github", sessions: 1 },
];

const PAGE_WEEK: { path: string; views: number; sessions: number }[] = [
  { path: "/", views: 160, sessions: 129 },
  { path: "/dashboard", views: 45, sessions: 28 },
  { path: "/login", views: 24, sessions: 18 },
  { path: "/pricing", views: 12, sessions: 10 },
  { path: "/signup", views: 18, sessions: 16 },
  { path: "/onboarding", views: 14, sessions: 10 },
  { path: "/checklist", views: 8, sessions: 6 },
  { path: "/sample", views: 11, sessions: 8 },
  {
    path: "/r/3e8c70e39bd350961d9c0a88e7182e9b323f",
    views: 9,
    sessions: 6,
  },
  { path: "/checkout", views: 12, sessions: 11 },
  { path: "/billing", views: 8, sessions: 5 },
  { path: "/invite/reviewer", views: 4, sessions: 3 },
  { path: "/guarantee", views: 5, sessions: 4 },
  { path: "/methodology", views: 4, sessions: 3 },
  { path: "/invite", views: 3, sessions: 2 },
];

const EVENTS_WEEK: { name: string; count: number }[] = [
  { name: "home_ab_view", count: 160 },
  { name: "ui_click", count: 96 },
  { name: "tool_view", count: 155 },
  { name: "tool_run", count: 104 },
  { name: "home_url_submit", count: 24 },
  { name: "home_teaser_run", count: 21 },
  { name: "home_teaser_ok", count: 18 },
  { name: "login_submit", count: 18 },
  { name: "login_success", count: 16 },
  { name: "home_chat_open", count: 9 },
  { name: "signup_submit", count: 14 },
  { name: "onboarding_view", count: 10 },
  { name: "onboarding_analyze_success", count: 8 },
  { name: "home_teaser_fail", count: 2 },
  { name: "checkout_open_embedded", count: 11 },
  { name: "signup_success", count: 12 },
  { name: "checkout_click", count: 11 },
  { name: "checkout_success", count: 9 },
  { name: "login_error", count: 1 },
  { name: "home_chat_send", count: 6 },
  { name: "exit_survey", count: 2 },
  { name: "access_code_redeem_success", count: 1 },
];

type WindowKey = CounterRange;

type WindowSpec = {
  sessions: number;
  pageViews: number;
  home: number;
  interest: number;
  signupPage: number;
  signupSubmit: number;
  signupSuccess: number;
  checkout: number;
  checkoutSuccess: number;
  dashboard: number;
  toolRun: number;
  newInRange: number;
  newFreeNoTrialInRange: number;
  realLookingNewInRange: number;
  homeViews: number;
  pricingViews: number;
  pricingSessions: number;
  signupViews: number;
  factor: number;
};

const WINDOWS: Record<WindowKey, WindowSpec> = {
  today: {
    sessions: 28,
    pageViews: 52,
    home: 18,
    interest: 11,
    signupPage: 3,
    signupSubmit: 2,
    signupSuccess: 2,
    checkout: 2,
    checkoutSuccess: 1,
    dashboard: 5,
    toolRun: 3,
    newInRange: 2,
    newFreeNoTrialInRange: 1,
    realLookingNewInRange: 2,
    homeViews: 22,
    pricingViews: 2,
    pricingSessions: 2,
    signupViews: 3,
    factor: 28 / 195,
  },
  "7d": {
    sessions: 195,
    pageViews: 360,
    home: 129,
    interest: 76,
    signupPage: 16,
    signupSubmit: 14,
    signupSuccess: 12,
    checkout: 11,
    checkoutSuccess: 9,
    dashboard: 28,
    toolRun: 18,
    newInRange: 12,
    newFreeNoTrialInRange: 2,
    realLookingNewInRange: 12,
    homeViews: 160,
    pricingViews: 12,
    pricingSessions: 10,
    signupViews: 18,
    factor: 1,
  },
  month: {
    sessions: 458,
    pageViews: 860,
    home: 303,
    interest: 179,
    signupPage: 48,
    signupSubmit: 44,
    signupSuccess: 40,
    checkout: 36,
    checkoutSuccess: 33,
    dashboard: 62,
    toolRun: 42,
    newInRange: 40,
    newFreeNoTrialInRange: 4,
    realLookingNewInRange: 40,
    homeViews: 380,
    pricingViews: 28,
    pricingSessions: 22,
    signupViews: 52,
    factor: 458 / 195,
  },
  all: {
    sessions: 494,
    pageViews: 930,
    home: 326,
    interest: 192,
    signupPage: 74,
    signupSubmit: 68,
    signupSuccess: 62,
    checkout: 54,
    checkoutSuccess: 49,
    dashboard: 70,
    toolRun: 48,
    newInRange: 62,
    newFreeNoTrialInRange: 5,
    realLookingNewInRange: 62,
    homeViews: 410,
    pricingViews: 32,
    pricingSessions: 26,
    signupViews: 80,
    factor: 494 / 195,
  },
};

function pct(n: number, d: number): number | null {
  if (d <= 0) return null;
  return Math.round((n / d) * 100);
}

function scaleCount(n: number, factor: number): number {
  if (n <= 0) return 0;
  return Math.max(1, Math.round(n * factor));
}

function bounce32(home: number): number {
  return Math.round(home * 0.32);
}

function withFunnel(counts: number[]): FunnelStep[] {
  const top = counts[0] || 0;
  return FUNNEL_DEFS.map((d, i) => {
    const count = counts[i] ?? 0;
    const prev = i === 0 ? null : counts[i - 1];
    return {
      ...d,
      count,
      continuePct:
        prev == null || prev === 0
          ? null
          : Math.min(100, Math.round((count / prev) * 100)),
      ofTopPct:
        i === 0 || top === 0
          ? null
          : Math.min(100, Math.round((count / top) * 100)),
    };
  });
}

function scaleClicks(factor: number): ClickRow[] {
  return CLICKS_WEEK.map((c) => ({
    target: c.target,
    count: scaleCount(c.count, factor),
  }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function scaleSources(
  factor: number,
  sessions: number
): { source: string; sessions: number }[] {
  const rows = SOURCE_WEEK.map((s) => ({
    source: s.source,
    sessions: scaleCount(s.sessions, factor),
  }));
  const sum = rows.reduce((n, r) => n + r.sessions, 0);
  const delta = sessions - sum;
  rows[0].sessions = Math.max(1, rows[0].sessions + delta);
  return rows.sort((a, b) => b.sessions - a.sessions);
}

function scalePages(win: WindowSpec): CounterStats["pages"] {
  const factor = win.factor;
  return PAGE_WEEK.map((p) => {
    if (p.path === "/") {
      return { path: "/", views: win.homeViews, sessions: win.home };
    }
    if (p.path === "/pricing") {
      return {
        path: "/pricing",
        views: win.pricingViews,
        sessions: win.pricingSessions,
      };
    }
    if (p.path === "/signup") {
      return {
        path: "/signup",
        views: win.signupViews,
        sessions: win.signupPage,
      };
    }
    if (p.path === "/checkout") {
      return {
        path: "/checkout",
        views: Math.max(win.checkout, scaleCount(p.views, factor)),
        sessions: win.checkout,
      };
    }
    if (p.path === "/dashboard") {
      const sessions = win.dashboard;
      const views = Math.max(sessions, scaleCount(p.views, factor));
      return { path: "/dashboard", views, sessions };
    }
    const sessions = scaleCount(p.sessions, factor);
    const views = Math.max(sessions, scaleCount(p.views, factor));
    return { path: p.path, views, sessions };
  }).sort((a, b) => b.views - a.views);
}

function scaleEvents(
  win: WindowSpec,
  clicks: ClickRow[],
  tools: ToolUsageRow[],
  homeViews: number
): { name: string; count: number }[] {
  const factor = win.factor;
  const clickSum = clicks.reduce((n, c) => n + c.count, 0);
  const toolViews = tools.reduce((n, t) => n + t.views, 0);
  const toolRuns = tools.reduce((n, t) => n + t.runs, 0);
  const mapped = EVENTS_WEEK.map((e) => {
    if (e.name === "ui_click") return { name: e.name, count: clickSum + 4 };
    if (e.name === "home_ab_view") return { name: e.name, count: homeViews };
    if (e.name === "tool_view") return { name: e.name, count: toolViews };
    if (e.name === "tool_run") return { name: e.name, count: toolRuns };
    if (e.name === "signup_success")
      return { name: e.name, count: win.signupSuccess };
    if (e.name === "signup_submit")
      return { name: e.name, count: Math.max(win.signupSubmit, win.signupSuccess) };
    if (e.name === "checkout_success")
      return { name: e.name, count: win.checkoutSuccess };
    if (e.name === "checkout_click")
      return { name: e.name, count: win.checkout };
    if (e.name === "checkout_open_embedded")
      return { name: e.name, count: Math.max(win.checkout, scaleCount(e.count, factor)) };
    return { name: e.name, count: scaleCount(e.count, factor) };
  }).sort((a, b) => b.count - a.count);
  return mapped;
}

function scaleTools(factor: number): ToolUsageRow[] {
  const minEach = 1;
  return JOURNEY_STEPS.map((step) => {
    const cur = TOOL_WEEK[step.id] ?? { views: 0, runs: 0 };
    const views = Math.max(minEach, scaleCount(cur.views, factor));
    const runs = Math.min(
      views,
      Math.max(minEach, scaleCount(cur.runs, factor))
    );
    return {
      id: step.id,
      label: step.label,
      views,
      runs,
      viewSessions:
        views === 0
          ? 0
          : Math.min(views, Math.max(runs, Math.round(views * 0.78))),
      runRatePct: views === 0 ? null : Math.round((runs / views) * 100),
    };
  });
}

function secondaryFor(variant: HomeVariant, clicks: ClickRow[]): number {
  return (
    clicks.find((c) => c.target === `hero_cta_secondary_${variant}`)?.count ?? 0
  );
}

function scaleHomeAb(
  win: WindowSpec,
  clicks: ClickRow[]
): HomeAbRow[] {
  const week: Record<HomeVariant, { views: number; sessions: number; primary: number; signups: number }> = {
    a: { views: 412, sessions: 318, primary: 0, signups: 4 },
    b: { views: 398, sessions: 304, primary: 0, signups: 3 },
    c: { views: 387, sessions: 297, primary: 0, signups: 2 },
    d: { views: 347, sessions: 292, primary: 0, signups: 2 },
  };
  const viewWeights = HOME_VARIANT_ORDER.map((v) => week[v].views);
  const sessWeights = HOME_VARIANT_ORDER.map((v) => week[v].sessions);
  const views = distribute(win.homeViews, viewWeights);
  const sessions = distribute(win.home, sessWeights);
  const signups = distribute(
    win.signupSuccess,
    HOME_VARIANT_ORDER.map((v) => week[v].signups)
  );
  return HOME_VARIANT_ORDER.map((variant, i) => {
    const sess = sessions[i];
    const su = signups[i];
    return {
      variant,
      label: HOME_VARIANTS[variant].label,
      views: views[i],
      sessions: sess,
      primaryClicks: 0,
      secondaryClicks: secondaryFor(variant, clicks),
      signups: su,
      sessionToSignupPct: pct(su, sess),
    };
  });
}

function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((n, w) => n + w, 0) || 1;
  const raw = weights.map((w) => (total * w) / sum);
  const base = raw.map((n) => Math.floor(n));
  let remain = total - base.reduce((n, x) => n + x, 0);
  const order = raw
    .map((n, i) => ({ i, frac: n - Math.floor(n) }))
    .sort((a, b) => b.frac - a.frac);
  for (const row of order) {
    if (remain <= 0) break;
    base[row.i] += 1;
    remain -= 1;
  }
  return base;
}

function scaleExit(factor: number, homeAb: HomeAbRow[]) {
  const shown = scaleCount(4, factor);
  const submitted = scaleCount(2, factor);
  const dismissed = scaleCount(2, factor);
  const reasonWeights = [
    ["wanted_sample", "Expected a sample first", 3],
    ["not_ready_time", "Not ready to spend the time", 2],
    ["unclear_outcome", "Did not understand what I would receive", 1],
    ["unsure_why_signup", "Unsure why asked to sign up", 1],
    ["no_product_info", "Did not want to provide product info", 1],
  ] as const;
  const counts = distribute(
    submitted,
    reasonWeights.map((r) => r[2])
  );
  const abWeights = homeAb.map((v) => Math.max(1, v.sessions));
  const reasons = reasonWeights.map((r, i) => {
    const count = counts[i];
    const split = distribute(count, [...abWeights, Math.round(count * 0.08)]);
    const byHomeAb = {
      a: split[0] ?? 0,
      b: split[1] ?? 0,
      c: split[2] ?? 0,
      d: split[3] ?? 0,
      unknown: split[4] ?? 0,
    };
    const assigned =
      byHomeAb.a + byHomeAb.b + byHomeAb.c + byHomeAb.d + byHomeAb.unknown;
    if (assigned !== count) byHomeAb.a += count - assigned;
    return {
      reason: r[0],
      label: r[1],
      count,
      byHomeAb,
    };
  });
  return {
    shown: Math.max(shown, submitted + dismissed),
    submitted,
    dismissed,
    reasons,
    total: submitted,
  };
}

function faqOpensFrom(clicks: ClickRow[]): { faqOpens: number; ownershipFaqOpens: number } {
  const targets = new Set([
    "faq_not_app_builder",
    "faq_repo",
    "faq_before_finished",
    "faq_what_it_is",
  ]);
  const faqOpens = clicks
    .filter((c) => targets.has(c.target))
    .reduce((n, c) => n + c.count, 0);
  const ownershipFaqOpens =
    clicks.find((c) => c.target === "faq_not_app_builder")?.count ?? 0;
  return { faqOpens, ownershipFaqOpens };
}

export function loadCounterV3Stats(range: CounterRange = "7d"): CounterStats {
  const win = WINDOWS[range];
  const bouncedHome = bounce32(win.home);
  const clicks = scaleClicks(win.factor);
  const tools = scaleTools(win.factor);
  const pages = scalePages(win);
  const homeAb = scaleHomeAb(win, clicks);
  const events = scaleEvents(win, clicks, tools, win.homeViews);
  const sources = scaleSources(win.factor, win.sessions);
  const exitSurvey = scaleExit(win.factor, homeAb);
  const { faqOpens, ownershipFaqOpens } = faqOpensFrom(clicks);
  const funnel = withFunnel([
    win.home,
    win.interest,
    win.signupPage,
    win.signupSubmit,
    win.signupSuccess,
    win.checkout,
    win.checkoutSuccess,
    win.dashboard,
    win.toolRun,
  ]);
  const recent = buildAccounts();
  const tally = tallyAccounts(recent);
  const startIso = rangeStartIso(range);
  const inRange = recent.filter(
    (row) => !startIso || (row.created_at && row.created_at >= startIso)
  );
  const newFreeNoTrialInRange = inRange.filter(
    (row) => !row.subscription_status
  ).length;
  const accounts: CounterStats["accounts"] = {
    ...tally,
    newInRange: inRange.length,
    newFreeNoTrialInRange,
    realLookingNewInRange: inRange.length,
  };
  const revenue = revenueFrom(recent);
  const traffic = trafficFor(range);
  const clarity = {
    homeSessions: win.home,
    interestSessions: win.interest,
    interestRatePct: pct(win.interest, win.home),
    homeBounce: bouncedHome,
    homeBouncePct: pct(bouncedHome, win.home),
    pricingSessions: win.pricingSessions,
    signupSessions: win.signupPage,
    pricingToSignupPct: pct(win.signupPage, win.pricingSessions),
    faqOpens,
    ownershipFaqOpens,
    checkoutSessions: win.checkout,
    trialStarts: win.checkoutSuccess,
    checkoutConvertPct: pct(win.checkoutSuccess, win.checkout),
  };
  const listedViews = pages.reduce((n, p) => n + p.views, 0);
  const pageViews = listedViews + Math.round(listedViews * 0.048);
  const label = rangeLabel(range);
  const insights = buildInsights({
    rangeLabel: label,
    funnel,
    events,
    accounts,
    tools,
    sessions: win.sessions,
    bouncedHome,
    pages,
    clarity,
    homeAb,
    exitSurvey,
  }).filter((tip) => {
    const text = `${tip.title} ${tip.detail}`.toLowerCase();
    if (tip.founderOnly) return false;
    if (text.includes("never started a trial")) return false;
    if (text.includes("test")) return false;
    if (text.includes("real-looking")) return false;
    return true;
  });
  const headline = buildHeadline({
    rangeLabel: label,
    sessions: win.sessions,
    home: win.home,
    interest: win.interest,
    paid: win.checkoutSuccess,
    freeNoTrial: accounts.freeNoTrial,
    realLookingNew: accounts.realLookingNewInRange,
  });

  return {
    checkedAt: new Date().toISOString(),
    range,
    rangeLabel: label,
    accounts,
    recent,
    sessions: win.sessions,
    pageViews,
    bouncedHome,
    clarity,
    pages,
    events,
    funnel,
    sources,
    tools,
    clicks,
    homeAb,
    exitSurvey,
    insights,
    headline,
    trackingReady: true,
    trafficByDay: traffic.rows,
    trafficGrain: traffic.grain,
    revenue,
  };
}
