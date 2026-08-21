/**
 * Hardcoded Counter snapshot for /admin/counter/v3.
 * Account statuses are disjoint and must sum to `total`.
 * Paid and trialing each take about half of the remaining seats after
 * 8 reviewers, 5 never-started, and 3 canceled.
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

function createdAt(daysAgo: number, hour: number, min: number): string {
  const d = new Date();
  d.setSeconds(0, 0);
  if (daysAgo === 0) {
    const cap = Math.max(0, d.getHours() - 1);
    d.setHours(Math.min(hour, cap), min, 0, 0);
  } else {
    d.setHours(hour, min, 0, 0);
    d.setDate(d.getDate() - daysAgo);
  }
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
    const created_at = createdAt(r.daysAgo, r.hour, r.min);
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

function trafficFor(
  range: CounterRange,
  total: number
): {
  grain: "hour" | "day";
  rows: NonNullable<CounterStats["trafficByDay"]>;
} {
  const now = new Date();
  if (range === "today") {
    const currentHour = now.getHours();
    const weights = Array.from({ length: currentHour + 1 }, (_, h) => {
      if (h < 6) return 0.15;
      if (h < 9) return 0.7;
      if (h < 12) return 1.2;
      if (h < 14) return 0.9;
      if (h < 18) return 1.25;
      if (h < 22) return 0.8;
      return 0.4;
    });
    const counts = distribute(total, weights);
    return {
      grain: "hour",
      rows: counts.map((sessions, h) => ({
        date: `${dayKey(now)}T${pad2(h)}`,
        label: hourLabel(h),
        sessions,
      })),
    };
  }
  const dayCount =
    range === "7d" ? 7 : range === "month" ? Math.max(1, now.getDate()) : 90;
  const dates = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(now);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (dayCount - 1 - i));
    return d;
  });
  const weights = dates.map((d, i) => {
    const t = dates.length <= 1 ? 1 : i / (dates.length - 1);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return (weekend ? 0.72 : 1) * (0.78 + 0.44 * t);
  });
  const counts = distribute(total, weights);
  return {
    grain: "day",
    rows: dates.map((d, i) => ({
      date: dayKey(d),
      label: dayLabel(d),
      sessions: counts[i],
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
  analyzer: { views: 186, runs: 142 },
  buyers: { views: 164, runs: 118 },
  pricing: { views: 148, runs: 102 },
  library: { views: 112, runs: 74 },
  funnel: { views: 98, runs: 68 },
  traffic: { views: 86, runs: 58 },
  launch: { views: 78, runs: 52 },
  content: { views: 104, runs: 72 },
  progress: { views: 64, runs: 44 },
  strategy: { views: 58, runs: 38 },
  sales: { views: 136, runs: 98 },
  results: { views: 52, runs: 34 },
  revenue: { views: 56, runs: 38 },
  dfy: { views: 42, runs: 24 },
  premium: { views: 48, runs: 28 },
};

const CLICKS_WEEK: ClickRow[] = [
  { target: "home_teaser_save", count: 86 },
  { target: "nba_continue", count: 74 },
  { target: "path_next", count: 68 },
  { target: "nav_start_trial", count: 54 },
  { target: "faq_what_it_is", count: 48 },
  { target: "footer_cta_signup", count: 44 },
  { target: "standard_brief_sample_open", count: 41 },
  { target: "first_win_cta_signup", count: 38 },
  { target: "faq_not_app_builder", count: 36 },
  { target: "hero_cta_secondary_a", count: 34 },
  { target: "hero_cta_secondary_b", count: 31 },
  { target: "hero_cta_secondary_c", count: 29 },
  { target: "faq_free_gtm", count: 28 },
  { target: "pro_review_sample_open", count: 28 },
  { target: "hero_cta_secondary_d", count: 26 },
  { target: "pains_cta_signup", count: 24 },
  { target: "pie_cta_signup", count: 22 },
  { target: "exit_survey_shown", count: 22 },
  { target: "path_back", count: 19 },
  { target: "faq_guarantee", count: 18 },
];

const SOURCE_WEEK: { source: string; sessions: number }[] = [
  { source: "(none / direct)", sessions: 891 },
  { source: "linkedin", sessions: 408 },
  { source: "google", sessions: 187 },
  { source: "x", sessions: 124 },
  { source: "newsletter", sessions: 76 },
  { source: "reddit", sessions: 51 },
  { source: "youtube", sessions: 33 },
  { source: "indiehackers", sessions: 22 },
  { source: "github", sessions: 18 },
  { source: "hn", sessions: 13 },
];

const PAGE_WEEK: { path: string; views: number; sessions: number }[] = [
  { path: "/", views: 1544, sessions: 1211 },
  { path: "/dashboard", views: 412, sessions: 164 },
  { path: "/login", views: 188, sessions: 142 },
  { path: "/pricing", views: 78, sessions: 64 },
  { path: "/signup", views: 34, sessions: 28 },
  { path: "/onboarding", views: 28, sessions: 18 },
  { path: "/checklist", views: 52, sessions: 41 },
  { path: "/sample", views: 88, sessions: 67 },
  {
    path: "/r/3e8c70e39bd350961d9c0a88e7182e9b323f",
    views: 71,
    sessions: 54,
  },
  { path: "/checkout", views: 22, sessions: 16 },
  { path: "/billing", views: 36, sessions: 24 },
  { path: "/invite/reviewer", views: 18, sessions: 12 },
  { path: "/guarantee", views: 27, sessions: 22 },
  { path: "/methodology", views: 24, sessions: 19 },
  { path: "/invite", views: 14, sessions: 9 },
];

const EVENTS_WEEK: { name: string; count: number }[] = [
  { name: "home_ab_view", count: 1544 },
  { name: "ui_click", count: 860 },
  { name: "tool_view", count: 1432 },
  { name: "tool_run", count: 990 },
  { name: "home_url_submit", count: 214 },
  { name: "home_teaser_run", count: 198 },
  { name: "home_teaser_ok", count: 176 },
  { name: "login_submit", count: 156 },
  { name: "login_success", count: 148 },
  { name: "home_chat_open", count: 92 },
  { name: "signup_submit", count: 19 },
  { name: "onboarding_view", count: 18 },
  { name: "onboarding_analyze_success", count: 16 },
  { name: "home_teaser_fail", count: 12 },
  { name: "checkout_open_embedded", count: 16 },
  { name: "signup_success", count: 11 },
  { name: "checkout_click", count: 16 },
  { name: "checkout_success", count: 12 },
  { name: "login_error", count: 4 },
  { name: "home_chat_send", count: 58 },
  { name: "exit_survey", count: 8 },
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
    sessions: 294,
    pageViews: 706,
    home: 196,
    interest: 118,
    signupPage: 5,
    signupSubmit: 4,
    signupSuccess: 2,
    checkout: 4,
    checkoutSuccess: 3,
    dashboard: 48,
    toolRun: 41,
    newInRange: 2,
    newFreeNoTrialInRange: 1,
    realLookingNewInRange: 2,
    homeViews: 248,
    pricingViews: 17,
    pricingSessions: 14,
    signupViews: 6,
    factor: 294 / 1823,
  },
  "7d": {
    sessions: 1823,
    pageViews: 4376,
    home: 1211,
    interest: 718,
    signupPage: 28,
    signupSubmit: 19,
    signupSuccess: 11,
    checkout: 16,
    checkoutSuccess: 12,
    dashboard: 164,
    toolRun: 138,
    newInRange: 11,
    newFreeNoTrialInRange: 2,
    realLookingNewInRange: 11,
    homeViews: 1544,
    pricingViews: 78,
    pricingSessions: 64,
    signupViews: 34,
    factor: 1,
  },
  month: {
    sessions: 5120,
    pageViews: 12288,
    home: 3398,
    interest: 2012,
    signupPage: 76,
    signupSubmit: 54,
    signupSuccess: 31,
    checkout: 48,
    checkoutSuccess: 36,
    dashboard: 428,
    toolRun: 352,
    newInRange: 31,
    newFreeNoTrialInRange: 4,
    realLookingNewInRange: 31,
    homeViews: 4320,
    pricingViews: 210,
    pricingSessions: 172,
    signupViews: 92,
    factor: 5120 / 1823,
  },
  all: {
    sessions: 14680,
    pageViews: 35232,
    home: 9724,
    interest: 5760,
    signupPage: 218,
    signupSubmit: 156,
    signupSuccess: 89,
    checkout: 98,
    checkoutSuccess: 76,
    dashboard: 1240,
    toolRun: 1028,
    newInRange: 89,
    newFreeNoTrialInRange: 5,
    realLookingNewInRange: 89,
    homeViews: 12480,
    pricingViews: 620,
    pricingSessions: 508,
    signupViews: 268,
    factor: 14680 / 1823,
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
    if (e.name === "ui_click") return { name: e.name, count: clickSum + 48 };
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
  const minEach = 10;
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
  const shown = scaleCount(22, factor);
  const submitted = scaleCount(8, factor);
  const dismissed = scaleCount(11, factor);
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
  const traffic = trafficFor(range, win.sessions);
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
