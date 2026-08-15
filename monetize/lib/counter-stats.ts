/**
 * Aggregate founder Counter stats from profiles + analytics_events.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { HOME_VARIANT_ORDER, HOME_VARIANTS, isHomeVariant, type HomeVariant } from "@/lib/home-ab";
import { JOURNEY_STEPS } from "@/lib/journey";

export type CounterRange = "today" | "7d" | "month" | "all";

export const COUNTER_RANGES: {
  id: CounterRange;
  label: string;
  short: string;
}[] = [
  { id: "today", label: "Today", short: "today" },
  { id: "7d", label: "Past week", short: "7d" },
  { id: "month", label: "This month", short: "month" },
  { id: "all", label: "All time", short: "all" },
];

export function parseCounterRange(raw: string | undefined | null): CounterRange {
  if (raw === "today" || raw === "7d" || raw === "month" || raw === "all") {
    return raw;
  }
  return "7d";
}

export function rangeLabel(range: CounterRange): string {
  return COUNTER_RANGES.find((r) => r.id === range)?.label ?? "Past week";
}

/** Inclusive start instant for the range, or null for all-time. */
export function rangeStartIso(range: CounterRange, now = new Date()): string | null {
  if (range === "all") return null;
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  // Calendar month in local time of the server (Vercel = UTC). Fine for founder ops.
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();
}

export type CounterRow = {
  id: string;
  email: string;
  name: string | null;
  subscription_status: string | null;
  current_tier: string | null;
  trial_ends_at: string | null;
  created_at: string | null;
  likelyTest: boolean;
  /** 1–100 if among first 100 accounts by created_at; else null. */
  earlyCohortRank: number | null;
};

export type FunnelStep = {
  key: string;
  label: string;
  hint: string;
  count: number;
  /** Share of previous step that continued (0-100). null if no prior or prior=0. */
  continuePct: number | null;
  /** Share of top-of-funnel (home sessions). */
  ofTopPct: number | null;
};

export type ToolUsageRow = {
  id: string;
  label: string;
  views: number;
  runs: number;
  viewSessions: number;
  runRatePct: number | null;
};

export type ClickRow = {
  target: string;
  count: number;
};

export type HomeAbRow = {
  variant: HomeVariant;
  label: string;
  views: number;
  sessions: number;
  primaryClicks: number;
  secondaryClicks: number;
  signups: number;
  sessionToSignupPct: number | null;
};

export type ExitSurveyRow = {
  reason: string;
  label: string;
  count: number;
  byHomeAb: Record<HomeVariant, number> & { unknown: number };
};

export type ExitSurveyActivity = {
  shown: number;
  submitted: number;
  dismissed: number;
  reasons: ExitSurveyRow[];
  /** Submitted responses with a reason (from exit_survey events). */
  total: number;
};

export type Insight = {
  severity: "critical" | "warn" | "info";
  title: string;
  detail: string;
  /** Hide on shareable /admin/activity (founder-only signals). */
  founderOnly?: boolean;
};

export type ClaritySignals = {
  homeSessions: number;
  interestSessions: number;
  interestRatePct: number | null;
  homeBounce: number;
  homeBouncePct: number | null;
  pricingSessions: number;
  signupSessions: number;
  pricingToSignupPct: number | null;
  faqOpens: number;
  ownershipFaqOpens: number;
  checkoutSessions: number;
  trialStarts: number;
  checkoutConvertPct: number | null;
};

export type CounterStats = {
  checkedAt: string;
  range: CounterRange;
  rangeLabel: string;
  accounts: {
    /** Current snapshot (not range-filtered). */
    total: number;
    freeNoTrial: number;
    trialing: number;
    reviewer: number;
    active: number;
    canceled: number;
    likelyTests: number;
    /** New profiles created inside the selected range. */
    newInRange: number;
    newFreeNoTrialInRange: number;
    realLookingNewInRange: number;
    /** How many of the first-100 learning cohort slots are filled. */
    earlyCohortFilled: number;
  };
  recent: CounterRow[];
  sessions: number;
  pageViews: number;
  /** Sessions that only hit marketing home and never engaged. */
  bouncedHome: number;
  clarity: ClaritySignals;
  pages: { path: string; views: number; sessions: number }[];
  events: { name: string; count: number }[];
  funnel: FunnelStep[];
  sources: { source: string; sessions: number }[];
  tools: ToolUsageRow[];
  clicks: ClickRow[];
  /** Homepage A/B/C for the selected window. */
  homeAb: HomeAbRow[];
  /** “What stopped you from continuing?” survey activity. */
  exitSurvey: ExitSurveyActivity;
  insights: Insight[];
  /** One-line headline for the selected window. */
  headline: string;
  trackingReady: boolean;
  trackingError?: string;
};

const EXIT_REASON_LABELS: Record<string, string> = {
  unclear_outcome: "Did not understand what I would receive",
  unsure_why_signup: "Unsure why asked to sign up",
  distrust_link: "Did not trust the access link",
  no_product_info: "Did not want to provide product info",
  wanted_sample: "Expected a sample first",
  not_ready_time: "Not ready to spend the time",
  other: "Other",
};

const FAQ_CLICK_TARGETS = new Set([
  "faq_not_app_builder",
  "faq_repo",
  "faq_before_finished",
  "faq_what_it_is",
]);

type EventRow = {
  name: string;
  path: string | null;
  session_id: string | null;
  utm_source: string | null;
  created_at: string;
  props: Record<string, unknown> | null;
};

function propString(
  props: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  if (!props) return null;
  const v = props[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

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

function sessionIdsFor(
  rows: EventRow[],
  pred: (r: EventRow) => boolean
): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    if (!pred(r)) continue;
    if (r.session_id) set.add(r.session_id);
  }
  return set;
}

function pathBase(path: string | null): string {
  if (!path) return "/";
  const bare = path.split("?")[0] || "/";
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
}

export function isLikelyTestAccount(
  email: string,
  name: string | null
): boolean {
  const e = email.trim().toLowerCase();
  const n = (name ?? "").trim().toLowerCase();
  if (!e) return false;
  if (/^test\d*@/.test(e)) return true;
  if (e.includes("+test") || e.includes("test@")) return true;
  if (/@test[\d.]*\./.test(e) || e.endsWith(".test")) return true;
  if (e.includes("roleferry.com")) return true;
  if (e.includes("oliveraellison")) return true;
  if (e === "ai@reliableainetwork.com") return true;
  if (/johnjsmith9{4,}/.test(e)) return true;
  if (/^test(\s*\d+)?$/.test(n)) return true;
  return false;
}

const TRIAL_CTA_TARGETS = new Set([
  "hero_cta_signup",
  "nav_start_trial",
  "footer_cta_signup",
  "activate_trial_click",
  "first_win_cta_signup",
  "pie_cta_signup",
  "faq_cta_signup",
]);

function isTrialCtaTarget(target: string): boolean {
  return (
    TRIAL_CTA_TARGETS.has(target) || /^hero_cta_primary_[abcd]$/.test(target)
  );
}

function emptyHomeAbBucket() {
  return {
    views: 0,
    sessions: new Set<string>(),
    primaryClicks: 0,
    secondaryClicks: 0,
    signups: 0,
  };
}

function emptyExitByHomeAb(): ExitSurveyRow["byHomeAb"] {
  return {
    ...Object.fromEntries(HOME_VARIANT_ORDER.map((v) => [v, 0])),
    unknown: 0,
  } as ExitSurveyRow["byHomeAb"];
}

function buildHomeAb(rows: EventRow[]): HomeAbRow[] {
  const stats = Object.fromEntries(
    HOME_VARIANT_ORDER.map((v) => [v, emptyHomeAbBucket()])
  ) as Record<HomeVariant, ReturnType<typeof emptyHomeAbBucket>>;

  for (const row of rows) {
    const props = row.props ?? {};
    if (row.name === "home_ab_view" && isHomeVariant(props.variant)) {
      const v = props.variant;
      stats[v].views += 1;
      if (row.session_id) stats[v].sessions.add(row.session_id);
    } else if (row.name === "signup_success" && isHomeVariant(props.home_ab)) {
      stats[props.home_ab].signups += 1;
    } else if (row.name === "ui_click" && typeof props.target === "string") {
      const m = /^hero_cta_(primary|secondary)_([abcd])$/.exec(props.target);
      if (m && isHomeVariant(m[2])) {
        if (m[1] === "primary") stats[m[2]].primaryClicks += 1;
        else stats[m[2]].secondaryClicks += 1;
      }
    }
  }

  return (Object.keys(HOME_VARIANTS) as HomeVariant[]).map((variant) => {
    const s = stats[variant];
    const sessions = s.sessions.size;
    return {
      variant,
      label: HOME_VARIANTS[variant].label,
      views: s.views,
      sessions,
      primaryClicks: s.primaryClicks,
      secondaryClicks: s.secondaryClicks,
      signups: s.signups,
      sessionToSignupPct: pct(s.signups, sessions),
    };
  });
}

function buildExitSurvey(rows: EventRow[]): ExitSurveyActivity {
  let shown = 0;
  let submitted = 0;
  let dismissed = 0;
  const map = new Map<
    string,
    { count: number; byHomeAb: ExitSurveyRow["byHomeAb"] }
  >();

  for (const r of rows) {
    if (r.name === "ui_click") {
      const target = propString(r.props, "target");
      if (target === "exit_survey_shown") shown += 1;
      else if (target === "exit_survey_submit") submitted += 1;
      else if (target === "exit_survey_dismiss") dismissed += 1;
      continue;
    }
    if (r.name !== "exit_survey") continue;
    const reason = propString(r.props, "reason") ?? "other";
    const cur = map.get(reason) ?? {
      count: 0,
      byHomeAb: emptyExitByHomeAb(),
    };
    cur.count += 1;
    const homeAb = r.props?.home_ab;
    if (isHomeVariant(homeAb)) cur.byHomeAb[homeAb] += 1;
    else cur.byHomeAb.unknown += 1;
    map.set(reason, cur);
  }

  // Fallback: reason breakdown from client ui_click if server event missing.
  if (map.size === 0) {
    for (const r of rows) {
      if (r.name !== "ui_click") continue;
      if (propString(r.props, "target") !== "exit_survey_submit") continue;
      const reason = propString(r.props, "reason") ?? "other";
      const cur = map.get(reason) ?? {
        count: 0,
        byHomeAb: emptyExitByHomeAb(),
      };
      cur.count += 1;
      const homeAb = r.props?.home_ab;
      if (isHomeVariant(homeAb)) cur.byHomeAb[homeAb] += 1;
      else cur.byHomeAb.unknown += 1;
      map.set(reason, cur);
    }
  }

  const reasons = [...map.entries()]
    .map(([reason, v]) => ({
      reason,
      label: EXIT_REASON_LABELS[reason] ?? reason,
      count: v.count,
      byHomeAb: v.byHomeAb,
    }))
    .sort((a, b) => b.count - a.count);

  const total = reasons.reduce((n, row) => n + row.count, 0);
  if (submitted === 0 && total > 0) submitted = total;

  return { shown, submitted, dismissed, reasons, total };
}

function buildFunnel(rows: EventRow[]): FunnelStep[] {
  // Strict sequential path so continue% always means "of the previous step".
  const defs: {
    key: string;
    label: string;
    hint: string;
    pred: (r: EventRow) => boolean;
  }[] = [
    {
      key: "home",
      label: "Saw homepage",
      hint: "Unique sessions with a home page view",
      pred: (r) => r.name === "page_view" && pathBase(r.path) === "/",
    },
    {
      key: "interest",
      label: "Showed interest",
      hint: "Trial CTA click, or visited Pricing / Checklist / Signup",
      pred: (r) =>
        (r.name === "ui_click" &&
          isTrialCtaTarget(String(propString(r.props, "target") ?? ""))) ||
        (r.name === "page_view" &&
          ["/pricing", "/signup", "/checklist"].includes(pathBase(r.path))),
    },
    {
      key: "signup_page",
      label: "Opened signup",
      hint: "Visited /signup",
      pred: (r) =>
        r.name === "page_view" && pathBase(r.path) === "/signup",
    },
    {
      key: "signup_submit",
      label: "Started signup form",
      hint: "Clicked create account",
      pred: (r) => r.name === "signup_submit",
    },
    {
      key: "signup_success",
      label: "Account created",
      hint: "signup_success (includes tests)",
      pred: (r) => r.name === "signup_success",
    },
    {
      key: "checkout",
      label: "Opened checkout",
      hint: "Embedded Stripe or checkout page",
      pred: (r) =>
        r.name === "checkout_open_embedded" ||
        r.name === "checkout_click" ||
        (r.name === "page_view" && pathBase(r.path) === "/checkout"),
    },
    {
      key: "checkout_success",
      label: "Started trial (card)",
      hint: "checkout_success — card collected, trial live",
      pred: (r) => r.name === "checkout_success",
    },
    {
      key: "dashboard",
      label: "Reached dashboard",
      hint: "Logged-in product surface",
      pred: (r) =>
        r.name === "page_view" && pathBase(r.path).startsWith("/dashboard"),
    },
    {
      key: "tool_run",
      label: "Ran a tool",
      hint: "At least one successful generate",
      pred: (r) => r.name === "tool_run",
    },
  ];

  const counts = defs.map((d) => sessionsFor(rows, d.pred));
  const top = counts[0] || 0;

  return defs.map((d, i) => {
    const count = counts[i];
    const prev = i === 0 ? null : counts[i - 1];
    const continuePct =
      prev === null || prev === 0
        ? null
        : Math.min(100, Math.round((count / prev) * 100));
    const ofTopPct =
      i === 0 || top === 0
        ? null
        : Math.min(100, Math.round((count / top) * 100));
    return {
      key: d.key,
      label: d.label,
      hint: d.hint,
      count,
      continuePct,
      ofTopPct,
    };
  });
}

function buildToolUsage(rows: EventRow[]): ToolUsageRow[] {
  const byId = new Map<
    string,
    { views: number; runs: number; viewSessions: Set<string> }
  >();

  for (const step of JOURNEY_STEPS) {
    byId.set(step.id, { views: 0, runs: 0, viewSessions: new Set() });
  }

  for (const r of rows) {
    if (r.name !== "tool_view" && r.name !== "tool_run") continue;
    const tool = propString(r.props, "tool");
    if (!tool) continue;
    const cur = byId.get(tool) ?? {
      views: 0,
      runs: 0,
      viewSessions: new Set<string>(),
    };
    if (r.name === "tool_view") {
      cur.views += 1;
      if (r.session_id) cur.viewSessions.add(r.session_id);
    } else {
      cur.runs += 1;
    }
    byId.set(tool, cur);
  }

  return JOURNEY_STEPS.map((step) => {
    const cur = byId.get(step.id)!;
    const runRatePct =
      cur.views === 0 ? null : Math.round((cur.runs / cur.views) * 100);
    return {
      id: step.id,
      label: step.label,
      views: cur.views,
      runs: cur.runs,
      viewSessions: cur.viewSessions.size || (cur.views ? cur.views : 0),
      runRatePct,
    };
  });
}

function buildClicks(rows: EventRow[]): ClickRow[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.name !== "ui_click") continue;
    const target = propString(r.props, "target") ?? "(unnamed)";
    map.set(target, (map.get(target) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function eventCount(
  events: { name: string; count: number }[],
  name: string
): number {
  return events.find((e) => e.name === name)?.count ?? 0;
}

function pct(n: number, d: number): number | null {
  if (d <= 0) return null;
  return Math.round((n / d) * 100);
}

function buildInsights(args: {
  rangeLabel: string;
  funnel: FunnelStep[];
  events: { name: string; count: number }[];
  accounts: CounterStats["accounts"];
  tools: ToolUsageRow[];
  sessions: number;
  bouncedHome: number;
  pages: { path: string; views: number; sessions: number }[];
  clarity: ClaritySignals;
  homeAb: HomeAbRow[];
  exitSurvey: ExitSurveyActivity;
}): Insight[] {
  const {
    rangeLabel,
    funnel,
    events,
    accounts,
    tools,
    sessions,
    bouncedHome,
    pages,
    clarity,
    homeAb,
    exitSurvey,
  } = args;
  const exitSurveyTotal = exitSurvey.total;
  const byKey = Object.fromEntries(funnel.map((f) => [f.key, f]));
  const tips: Insight[] = [];

  const home = byKey.home?.count ?? 0;
  const interest = byKey.interest?.count ?? 0;
  const signupPage = byKey.signup_page?.count ?? 0;
  const signupSubmit = byKey.signup_submit?.count ?? 0;
  const signupOk = byKey.signup_success?.count ?? 0;
  const checkout = byKey.checkout?.count ?? 0;
  const paid = byKey.checkout_success?.count ?? 0;

  if (sessions === 0 && accounts.newInRange === 0) {
    tips.push({
      severity: "info",
      title: `No traffic in ${rangeLabel.toLowerCase()}`,
      detail:
        "Nothing to diagnose yet. Drive visits with UTM links (?utm_source=linkedin&utm_medium=dm).",
    });
    return tips;
  }

  if (home > 5 && bouncedHome / home >= 0.7) {
    tips.push({
      severity: "critical",
      title: `${bouncedHome} of ${home} home visitors bounced`,
      detail: `${pct(bouncedHome, home)}% never clicked a trial CTA or opened Pricing, Checklist, or Signup. Category clarity in the first fold is the first place to look.`,
    });
  } else if (home > 5 && interest > 0 && (pct(interest, home) ?? 0) < 25) {
    tips.push({
      severity: "critical",
      title: `Only ${interest} of ${home} home visitors showed interest (${pct(interest, home)}%)`,
      detail:
        "Most people leave the homepage without Pricing, Signup, or a trial click. Tighten the hero promise and primary CTA.",
    });
  }

  const pricingSess =
    pages.find((p) => p.path === "/pricing")?.sessions ?? 0;
  if (pricingSess >= 5 && signupPage < pricingSess * 0.35) {
    tips.push({
      severity: "warn",
      title: `Pricing is a scare-off (${pricingSess} visits → ${signupPage} signup pages)`,
      detail: `Only ${pct(signupPage, pricingSess)}% of Pricing visitors continue to Signup. Price, trial clarity, or trust on /pricing is likely the wall.`,
    });
  }

  if (signupPage >= 3 && signupSubmit < signupPage * 0.5) {
    tips.push({
      severity: "warn",
      title: `${signupPage - signupSubmit} people opened Signup and did not start the form`,
      detail: `${signupSubmit} of ${signupPage} sessions submitted (${pct(signupSubmit, signupPage)}%). Form length, Terms checkbox, or “why give email” trust may be stopping them.`,
    });
  }

  if (accounts.freeNoTrial > 0) {
    const realFree = Math.max(
      0,
      accounts.freeNoTrial - Math.min(accounts.likelyTests, accounts.freeNoTrial)
    );
    tips.push({
      severity: realFree > 0 ? "critical" : "info",
      title: `${accounts.freeNoTrial} accounts never started a trial`,
      detail:
        realFree > 0
          ? `${realFree}+ look like real people who created an account then left before entering a card. That is the post-signup scare-off (checkout, price fear, or “I’ll do it later”).`
          : "Most of these look like your own test accounts. Filter “Likely test” in Recent accounts.",
      // Founder-only when every free account looks like a test (hidden on /admin/activity).
      founderOnly: realFree === 0,
    });
  }

  if (checkout >= 3 && paid < checkout * 0.5) {
    tips.push({
      severity: "critical",
      title: `Checkout abandon: ${paid} trials from ${checkout} checkout sessions (${pct(paid, checkout)}%)`,
      detail:
        "People reach Stripe then bail. Common causes: sticker shock after promo expectation, card hesitation, or unclear trial-then-charge copy.",
    });
  }

  const loginErr = eventCount(events, "login_error");
  const loginOk = eventCount(events, "login_success");
  if (loginErr + loginOk >= 4 && loginErr >= loginOk) {
    tips.push({
      severity: "warn",
      title: `Login is failing half the time (${loginErr} errors / ${loginOk} successes)`,
      detail:
        "Returning users (or you) are hitting wrong-password / confirm-email friction. That also inflates “accounts” that never reach the product.",
    });
  }

  const authCb = eventCount(events, "auth_callback_error");
  if (authCb >= 3) {
    tips.push({
      severity: "warn",
      title: `${authCb} auth callback errors`,
      detail:
        "Email confirm / magic-link landings are failing. Check Supabase redirect URLs for MakeItRainApp.com.",
    });
  }

  if (
    accounts.realLookingNewInRange === 0 &&
    accounts.newInRange > 0 &&
    home > 20
  ) {
    tips.push({
      severity: "info",
      title: `No real-looking new signups in ${rangeLabel.toLowerCase()}`,
      detail: `${accounts.newInRange} new account(s) look like tests. Traffic (${sessions} sessions) is not converting into genuine trials yet.`,
      founderOnly: true,
    });
  }

  const faqOpens = clarity.faqOpens;
  if (home >= 40 && faqOpens === 0 && (clarity.homeBouncePct ?? 0) >= 60) {
    tips.push({
      severity: "info",
      title: "High home bounce and zero FAQ opens",
      detail:
        "People leave before reading ownership / “not an app builder” answers. Either they never scroll, or the first fold still fails the category test.",
    });
  } else if (clarity.ownershipFaqOpens > 0) {
    tips.push({
      severity: "info",
      title: `${clarity.ownershipFaqOpens} open(s) of the code-ownership FAQ`,
      detail:
        "Visitors are actively checking whether you build or own their software. Keep that answer visible above the fold via the ownership strip.",
    });
  }

  const sticky = tools
    .filter((t) => t.views >= 3 && t.runs === 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 2);
  for (const t of sticky) {
    tips.push({
      severity: "warn",
      title: `${t.label}: ${t.views} opens, 0 runs`,
      detail:
        "People open the tool then leave without generating. Check empty state, required inputs, or the generate button.",
    });
  }

  const analyzer = tools.find((t) => t.id === "analyzer");
  if (
    analyzer &&
    analyzer.views >= 10 &&
    (analyzer.runRatePct ?? 0) < 20
  ) {
    tips.push({
      severity: "info",
      title: `Idea Analyzer curiosity without commitment (${analyzer.runRatePct}% run rate)`,
      detail: `${analyzer.views} views → ${analyzer.runs} runs. First tool friction trains people that the product is “look, don’t use.”`,
    });
  }

  if (exitSurveyTotal >= 3 && exitSurvey.reasons[0]) {
    const top = exitSurvey.reasons[0];
    const share = pct(top.count, exitSurveyTotal);
    tips.push({
      severity: (share ?? 0) >= 40 ? "warn" : "info",
      title: `Exit survey top reason: ${top.label} (${top.count}/${exitSurveyTotal})`,
      detail: `From “What stopped you from continuing?” · shown ${exitSurvey.shown}, dismissed ${exitSurvey.dismissed}.`,
    });
  } else if (exitSurvey.shown >= 5 && exitSurvey.submitted === 0) {
    tips.push({
      severity: "info",
      title: `Exit survey shown ${exitSurvey.shown}× with 0 submits`,
      detail:
        "People see “What stopped you from continuing?” then leave without answering. Optional — not a funnel leak by itself.",
    });
  }

  const rankedAb = [...homeAb]
    .filter((v) => v.sessions >= 20)
    .sort(
      (a, b) => (b.sessionToSignupPct ?? -1) - (a.sessionToSignupPct ?? -1)
    );
  if (rankedAb.length >= 2) {
    const best = rankedAb[0];
    const worst = rankedAb[rankedAb.length - 1];
    if (
      best.sessionToSignupPct != null &&
      worst.sessionToSignupPct != null &&
      best.sessionToSignupPct - worst.sessionToSignupPct >= 3
    ) {
      tips.push({
        severity: "info",
        title: `Homepage ${best.variant.toUpperCase()} leads session→signup (${best.sessionToSignupPct}% vs ${worst.variant.toUpperCase()} ${worst.sessionToSignupPct}%)`,
        detail: `${best.label} vs ${worst.label}. Kill the lagging variant after ~300 sessions each.`,
      });
    }
  }

  if (tips.length === 0) {
    tips.push({
      severity: "info",
      title: "No sharp leak in this window",
      detail:
        "Funnel steps look relatively healthy. Keep watching free-no-trial accounts and checkout success rate as volume grows.",
    });
  }

  const order = { critical: 0, warn: 1, info: 2 };
  return tips.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 8);
}

function buildHeadline(args: {
  rangeLabel: string;
  sessions: number;
  home: number;
  interest: number;
  paid: number;
  freeNoTrial: number;
  realLookingNew: number;
}): string {
  const {
    rangeLabel,
    sessions,
    home,
    interest,
    paid,
    freeNoTrial,
    realLookingNew,
  } = args;
  if (sessions === 0) {
    return `No measured sessions in ${rangeLabel.toLowerCase()}.`;
  }
  const engage = pct(interest, home || sessions);
  const parts = [
    `${sessions} sessions`,
    home ? `${engage ?? 0}% of home visitors showed interest` : null,
    paid
      ? `${paid} trial start${paid === 1 ? "" : "s"} (card)`
      : "0 trial starts with a card",
    freeNoTrial
      ? `${freeNoTrial} account${freeNoTrial === 1 ? "" : "s"} still free (never started trial)`
      : null,
    realLookingNew === 0 && sessions > 30
      ? "no real-looking new signups this window"
      : null,
  ].filter(Boolean);
  return parts.join(" · ") + ".";
}

export async function loadCounterStats(
  range: CounterRange = "7d"
): Promise<CounterStats | { error: string }> {
  try {
    const admin = createAdminClient();
    const startIso = rangeStartIso(range);
    const eventLimit = range === "all" || range === "month" ? 15000 : 8000;

    let eventsQuery = admin
      .from("analytics_events")
      .select("name, path, session_id, utm_source, created_at, props")
      .order("created_at", { ascending: false })
      .limit(eventLimit);
    if (startIso) eventsQuery = eventsQuery.gte("created_at", startIso);

    let newInRangeQuery = admin
      .from("profiles")
      .select("*", { count: "exact", head: true });
    if (startIso) newInRangeQuery = newInRangeQuery.gte("created_at", startIso);

    const [
      { count: total, error: totalError },
      { count: freeNoTrial, error: freeError },
      { count: trialing, error: trialError },
      { count: reviewer, error: reviewerError },
      { count: canceled, error: canceledError },
      { count: active, error: activeError },
      { count: newInRange, error: newError },
      { data: allProfilesLite, error: liteError },
      { data: recent, error: recentError },
      eventsRes,
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .is("subscription_status", null),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trialing"),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "reviewer"),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "canceled"),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active"),
      newInRangeQuery,
      admin.from("profiles").select("id, email, name, subscription_status, created_at"),
      admin
        .from("profiles")
        .select(
          "id, email, name, subscription_status, current_tier, trial_ends_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(40),
      eventsQuery,
    ]);

    const profileError =
      totalError ||
      freeError ||
      trialError ||
      reviewerError ||
      canceledError ||
      activeError ||
      newError ||
      liteError ||
      recentError;
    if (profileError) return { error: profileError.message };

    const profileRows = (allProfilesLite ?? []) as {
      id: string;
      email: string;
      name: string | null;
      subscription_status: string | null;
      created_at: string | null;
    }[];

    let likelyTests = 0;
    let newFreeNoTrialInRange = 0;
    let realLookingNewInRange = 0;
    for (const p of profileRows) {
      const test = isLikelyTestAccount(p.email, p.name);
      if (test) likelyTests += 1;
      const inRange =
        !startIso || (!!p.created_at && p.created_at >= startIso);
      if (!inRange) continue;
      if (!p.subscription_status) newFreeNoTrialInRange += 1;
      if (!test) realLookingNewInRange += 1;
    }

    const byCreated = [...profileRows].sort((a, b) =>
      (a.created_at ?? "").localeCompare(b.created_at ?? "")
    );
    const earlyRankById = new Map<string, number>();
    byCreated.forEach((p, i) => {
      if (i < 100) earlyRankById.set(p.id, i + 1);
    });

    const accounts: CounterStats["accounts"] = {
      total: total ?? 0,
      freeNoTrial: freeNoTrial ?? 0,
      trialing: trialing ?? 0,
      reviewer: reviewer ?? 0,
      active: active ?? 0,
      canceled: canceled ?? 0,
      likelyTests,
      newInRange: newInRange ?? 0,
      newFreeNoTrialInRange,
      realLookingNewInRange,
      earlyCohortFilled: Math.min(100, byCreated.length),
    };

    let trackingReady = true;
    let trackingError: string | undefined;
    let rows: EventRow[] = [];

    if (eventsRes.error) {
      trackingReady = false;
      trackingError = eventsRes.error.message;
    } else {
      rows = (eventsRes.data ?? []).map((r) => ({
        ...(r as Omit<EventRow, "props">),
        props:
          r.props && typeof r.props === "object" && !Array.isArray(r.props)
            ? (r.props as Record<string, unknown>)
            : null,
      }));
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
      .slice(0, 20);

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

    const homeSessions = sessionIdsFor(
      rows,
      (r) => r.name === "page_view" && pathBase(r.path) === "/"
    );
    const engagedSessions = sessionIdsFor(
      rows,
      (r) =>
        (r.name === "ui_click" &&
          isTrialCtaTarget(String(propString(r.props, "target") ?? ""))) ||
        (r.name === "page_view" &&
          ["/pricing", "/signup", "/checklist", "/checkout", "/login"].includes(
            pathBase(r.path)
          )) ||
        r.name === "signup_submit" ||
        r.name === "checklist_signup"
    );
    let bouncedHome = 0;
    for (const id of homeSessions) {
      if (!engagedSessions.has(id)) bouncedHome += 1;
    }

    const tools = trackingReady ? buildToolUsage(rows) : [];
    const clicks = trackingReady ? buildClicks(rows) : [];
    const funnel = trackingReady ? buildFunnel(rows) : [];
    const homeAb = trackingReady ? buildHomeAb(rows) : [];
    const exitSurveyBuilt = trackingReady
      ? buildExitSurvey(rows)
      : {
          shown: 0,
          submitted: 0,
          dismissed: 0,
          reasons: [] as ExitSurveyRow[],
          total: 0,
        };
    const sessions = uniqueSessions(rows);
    const label = rangeLabel(range);
    const byKey = Object.fromEntries(funnel.map((f) => [f.key, f]));

    const faqOpens = clicks
      .filter((c) => FAQ_CLICK_TARGETS.has(c.target))
      .reduce((n, c) => n + c.count, 0);
    const ownershipFaqOpens =
      clicks.find((c) => c.target === "faq_not_app_builder")?.count ?? 0;
    const pricingSessions =
      pages.find((p) => p.path === "/pricing")?.sessions ?? 0;
    const signupSessions =
      pages.find((p) => p.path === "/signup")?.sessions ??
      byKey.signup_page?.count ??
      0;
    const homeCount = byKey.home?.count ?? 0;
    const interestCount = byKey.interest?.count ?? 0;
    const checkoutCount = byKey.checkout?.count ?? 0;
    const trialCount = byKey.checkout_success?.count ?? 0;

    const clarity: ClaritySignals = {
      homeSessions: homeCount,
      interestSessions: interestCount,
      interestRatePct: pct(interestCount, homeCount),
      homeBounce: bouncedHome,
      homeBouncePct: pct(bouncedHome, homeCount),
      pricingSessions,
      signupSessions,
      pricingToSignupPct: pct(signupSessions, pricingSessions),
      faqOpens,
      ownershipFaqOpens,
      checkoutSessions: checkoutCount,
      trialStarts: trialCount,
      checkoutConvertPct: pct(trialCount, checkoutCount),
    };

    const insights = trackingReady
      ? buildInsights({
          rangeLabel: label,
          funnel,
          events,
          accounts,
          tools,
          sessions,
          bouncedHome,
          pages,
          clarity,
          homeAb,
          exitSurvey: exitSurveyBuilt,
        })
      : [
          {
            severity: "critical" as const,
            title: "Tracking unavailable",
            detail: trackingError?.includes("does not exist")
              ? "Run supabase/analytics_events.sql in the Supabase SQL editor."
              : trackingError ?? "Unknown error",
          },
        ];

    const headline = buildHeadline({
      rangeLabel: label,
      sessions,
      home: homeCount,
      interest: interestCount,
      paid: trialCount,
      freeNoTrial: accounts.freeNoTrial,
      realLookingNew: accounts.realLookingNewInRange,
    });

    const recentRows: CounterRow[] = ((recent ?? []) as Omit<
      CounterRow,
      "likelyTest" | "earlyCohortRank"
    >[]).map((row) => ({
      ...row,
      likelyTest: isLikelyTestAccount(row.email, row.name),
      earlyCohortRank: earlyRankById.get(row.id) ?? null,
    }));

    return {
      checkedAt: new Date().toISOString(),
      range,
      rangeLabel: label,
      accounts,
      recent: recentRows,
      sessions,
      pageViews: pageViewRows.length,
      bouncedHome,
      clarity,
      pages,
      events,
      funnel,
      sources,
      tools,
      clicks,
      homeAb,
      exitSurvey: exitSurveyBuilt,
      insights,
      headline,
      trackingReady,
      trackingError,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to load counter",
    };
  }
}
