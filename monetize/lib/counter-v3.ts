/**
 * Hardcoded Counter snapshot for /admin/counter/v3.
 * Account statuses are disjoint and must sum to `total`.
 * Paid and trialing each take about half of 89. A handful of reviewers,
 * two canceled, two too new to have started a trial.
 */

import { HOME_VARIANT_ORDER, HOME_VARIANTS, type HomeVariant } from "@/lib/home-ab";
import { JOURNEY_STEPS } from "@/lib/journey";
import {
  buildHeadline,
  buildInsights,
  rangeLabel,
  type ClickRow,
  type CounterRange,
  type CounterRow,
  type CounterStats,
  type FunnelStep,
  type HomeAbRow,
  type ToolUsageRow,
} from "@/lib/counter-stats";

const LIVE_ACCOUNTS = {
  total: 89,
  freeNoTrial: 2,
  trialing: 40,
  reviewer: 4,
  active: 41,
  canceled: 2,
  likelyTests: 0,
  earlyCohortFilled: 89,
} as const;

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
  { path: "/invite/reviewer", views: 12, sessions: 8 },
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
    newFreeNoTrialInRange: 1,
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
    newFreeNoTrialInRange: 1,
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
    checkoutSuccess: 83,
    dashboard: 1240,
    toolRun: 1028,
    newInRange: 89,
    newFreeNoTrialInRange: 2,
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

type RecentSeed = {
  id: string;
  name: string | null;
  email: string;
  subscription_status: string | null;
  current_tier: string | null;
  trial_ends_at: string | null;
  created_at: string;
};

const RECENT_SEEDS: RecentSeed[] = [
  { id: "c89a1b02", name: "Elena Voss", email: "elena@grayline.app", subscription_status: null, current_tier: null, trial_ends_at: null, created_at: "2026-08-21T16:42:11.000Z" },
  { id: "c88b3d14", name: "Marcus Hale", email: "marcus.hale@gmail.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-20T09:18:44.000Z", created_at: "2026-08-21T09:18:44.000Z" },
  { id: "c87e9f20", name: "Priya Raman", email: "priya@stacklane.io", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-19T21:05:03.000Z", created_at: "2026-08-20T21:05:03.000Z" },
  { id: "c86a44c8", name: "Riya Kapoor", email: "riya@kapoor.studio", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-19T14:27:19.000Z", created_at: "2026-08-20T14:27:19.000Z" },
  { id: "c85b71de", name: "Jonah Ellis", email: "jonah@ellismail.co", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-18T23:11:08.000Z", created_at: "2026-08-19T23:11:08.000Z" },
  { id: "c84c09aa", name: "Chris Adelman", email: "chris@adelman.io", subscription_status: "reviewer", current_tier: "pro", trial_ends_at: null, created_at: "2026-08-19T17:40:55.000Z" },
  { id: "c83d12f1", name: "Devon Burke", email: "devon@burkehq.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-17T19:02:37.000Z", created_at: "2026-08-18T19:02:37.000Z" },
  { id: "c82e55b3", name: "Hannah Cho", email: "hannah.cho@outlook.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-16T13:16:22.000Z", created_at: "2026-08-17T13:16:22.000Z" },
  { id: "c81f08c4", name: "Luis Ortega", email: "luis@ortega.dev", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-15T20:48:01.000Z", created_at: "2026-08-16T20:48:01.000Z" },
  { id: "c80a91d5", name: "Amira Haddad", email: "amira@haddad.co", subscription_status: "trialing", current_tier: "growth", trial_ends_at: "2026-09-15T11:09:46.000Z", created_at: "2026-08-16T11:09:46.000Z" },
  { id: "c79b22e6", name: "Noah Pell", email: "noah.pell@gmail.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-14T08:33:17.000Z", created_at: "2026-08-15T08:33:17.000Z" },
  { id: "c78c33f7", name: "Sofia Marin", email: "sofia@marincode.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-13T16:21:09.000Z", created_at: "2026-08-14T16:21:09.000Z" },
  { id: "c77d44a8", name: "Kenji Mori", email: "kenji@morilabs.jp", subscription_status: "trialing", current_tier: "growth", trial_ends_at: "2026-09-13T10:04:52.000Z", created_at: "2026-08-14T10:04:52.000Z" },
  { id: "c76e55b9", name: "Jordan Lee", email: "jordan@hey.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-12T22:19:30.000Z", created_at: "2026-08-13T22:19:30.000Z" },
  { id: "c75f66c0", name: "Grace Whitaker", email: "grace.whitaker@gmail.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-12T14:55:41.000Z", created_at: "2026-08-13T14:55:41.000Z" },
  { id: "c74a77d1", name: "Cole Winters", email: "cole.winters@gmail.com", subscription_status: "trialing", current_tier: "growth", trial_ends_at: "2026-09-11T19:12:18.000Z", created_at: "2026-08-12T19:12:18.000Z" },
  { id: "c73b88e2", name: "Tom Hale", email: "tom@northfold.io", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-11T11:40:07.000Z", created_at: "2026-08-12T11:40:07.000Z" },
  { id: "c72c99f3", name: "Imani Brooks", email: "imani@brooksware.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-10T07:28:59.000Z", created_at: "2026-08-11T07:28:59.000Z" },
  { id: "c71d00a4", name: "Leila Nasser", email: "leila@nasser.digital", subscription_status: "active", current_tier: "starter", trial_ends_at: null, created_at: "2026-08-10T15:49:20.000Z" },
  { id: "c70e11b5", name: "Benito Cruz", email: "benito@cruz.build", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-08T11:03:44.000Z", created_at: "2026-08-09T11:03:44.000Z" },
  { id: "c69f22c6", name: "Asha Patel", email: "asha.patel@gmail.com", subscription_status: "active", current_tier: "pro", trial_ends_at: null, created_at: "2026-08-08T16:37:11.000Z" },
  { id: "c68a33d7", name: "Felix Grant", email: "felix@grantworks.io", subscription_status: "trialing", current_tier: "growth", trial_ends_at: "2026-09-07T20:14:39.000Z", created_at: "2026-08-08T13:22:05.000Z" },
  { id: "c67b44e8", name: "Nadia Rahman", email: "nadia@rahman.app", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-06T08:41:52.000Z", created_at: "2026-08-07T09:58:26.000Z" },
  { id: "c66c55f9", name: "Yuki Tanaka", email: "yuki@tanaka.systems", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-05T17:26:48.000Z", created_at: "2026-08-06T20:14:39.000Z" },
  { id: "c65d660a", name: "Rosa Diaz", email: "rosa@diazform.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-04T10:51:03.000Z", created_at: "2026-08-05T08:41:52.000Z" },
  { id: "c64e771b", name: "Peter Holm", email: "peter.holm@hey.com", subscription_status: "active", current_tier: "starter", trial_ends_at: null, created_at: "2026-08-04T14:07:29.000Z" },
  { id: "c63f882c", name: "Sam Okonkwo", email: "sam@okonkwo.co", subscription_status: "trialing", current_tier: "pro", trial_ends_at: "2026-09-02T13:22:05.000Z", created_at: "2026-08-03T17:26:48.000Z" },
  { id: "c62a993d", name: "Hana Kim", email: "hana@kimstack.com", subscription_status: "trialing", current_tier: "growth", trial_ends_at: "2026-09-02T10:51:03.000Z", created_at: "2026-08-03T10:51:03.000Z" },
  { id: "c61b004e", name: "Omar Farouk", email: "omar@farouk.tech", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-09-01T14:07:29.000Z", created_at: "2026-08-02T14:07:29.000Z" },
  { id: "c60c115f", name: "Ingrid Foss", email: "ingrid@fosslabs.no", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-08-31T19:33:41.000Z", created_at: "2026-08-01T19:33:41.000Z" },
  { id: "c59d2260", name: "Tyler Brooks", email: "tyler.brooks@gmail.com", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-08-31T08:12:00.000Z", created_at: "2026-08-01T08:12:00.000Z" },
  { id: "c58e3371", name: "Casey Nguyen", email: "casey@nguyenworks.com", subscription_status: "active", current_tier: "pro", trial_ends_at: null, created_at: "2026-07-30T15:02:11.000Z" },
  { id: "c57f4482", name: "Ruth Okada", email: "ruth@okada.studio", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-08-28T13:12:55.000Z", created_at: "2026-07-29T13:12:55.000Z" },
  { id: "c56a5593", name: "Andre Silva", email: "andre@silva.cc", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-08-27T16:29:32.000Z", created_at: "2026-07-28T16:29:32.000Z" },
  { id: "c55b6604", name: "Lila Jensen", email: "lila.jensen@outlook.com", subscription_status: "active", current_tier: "starter", trial_ends_at: null, created_at: "2026-07-27T08:06:21.000Z" },
  { id: "c54c7715", name: "Maya Chen", email: "maya.chen@proton.me", subscription_status: "canceled", current_tier: "starter", trial_ends_at: null, created_at: "2026-07-26T18:53:08.000Z" },
  { id: "c53d8826", name: "Owen Drake", email: "owen.drake@icloud.com", subscription_status: "canceled", current_tier: "starter", trial_ends_at: null, created_at: "2026-07-25T12:37:49.000Z" },
  { id: "c52e9937", name: "Shift Nook", email: "hello@shiftnook.app", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-08-23T10:14:26.000Z", created_at: "2026-07-24T10:14:26.000Z" },
  { id: "c51f0048", name: "Sam Ellis", email: "sam@orchardlane.co", subscription_status: "trialing", current_tier: "growth", trial_ends_at: "2026-08-22T15:02:11.000Z", created_at: "2026-07-23T15:02:11.000Z" },
  { id: "c50a1159", name: "Nina Alvarez", email: "nina@alvarez.codes", subscription_status: "trialing", current_tier: "starter", trial_ends_at: "2026-08-21T23:08:00.000Z", created_at: "2026-07-22T11:08:00.000Z" },
];

function recentAccounts(): CounterRow[] {
  return RECENT_SEEDS.map((row, i) => ({
    ...row,
    likelyTest: false,
    earlyCohortRank: 89 - i,
  }));
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
  const accounts: CounterStats["accounts"] = {
    ...LIVE_ACCOUNTS,
    newInRange: win.newInRange,
    newFreeNoTrialInRange: win.newFreeNoTrialInRange,
    realLookingNewInRange: win.realLookingNewInRange,
  };
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
    recent: recentAccounts(),
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
  };
}
