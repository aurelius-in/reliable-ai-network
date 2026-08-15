/**
 * Linear monetization journey: 15 tools as pie slices.
 * Keeps existing tool ids/labels; adds story beats + completion signals.
 */

import type { TierName } from "@/lib/tiers";

/** Minimal dashboard snapshot used to fill pie slices. */
export interface JourneyCompletionSource {
  initialAnalyses: Record<string, unknown>;
  initialPricings: Record<string, unknown>;
  initialBuyers: unknown;
  initialFunnel: unknown;
  initialTraffic: unknown;
  initialLaunch: unknown;
  initialBundle: unknown;
  initialStrategy: object;
  initialSalesKit: unknown;
  initialRevenue: unknown;
  metricsEntries: unknown[];
  initialMetricsAnalysis: unknown;
  initialProgress: Record<string, boolean>;
  dfyRequests: unknown[];
}

export type JourneyTabId =
  | "analyzer"
  | "buyers"
  | "pricing"
  | "library"
  | "funnel"
  | "traffic"
  | "launch"
  | "content"
  | "progress"
  | "strategy"
  | "sales"
  | "results"
  | "revenue"
  | "dfy"
  | "premium";

export type JourneyPhase = "plan" | "execute" | "measure" | "scale";

export interface JourneyStep {
  id: JourneyTabId;
  label: string;
  /** Pain/outcome line for marketing and next-action framing */
  outcome: string;
  /** One short line for the story / next-action card */
  beat: string;
  /** Homepage pie sell copy (a few sentences). Keep beat short for in-app UI. */
  pitch: string;
  /** Tighter homepage pie copy for narrow screens. */
  pitchShort: string;
  tier: TierName;
  phase: JourneyPhase;
  /** Short label for tight pie UI */
  short: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "analyzer",
    label: "Idea Analyzer",
    short: "Idea",
    outcome: "Lock a hard commercial answer",
    beat: "Name one buyer, one valuable pain, and one smallest paid offer before more polish.",
    pitch:
      "Paste a product URL or brief and force a hard commercial answer: primary buyer, valuable pain, smallest paid offer, wedge clarity, and what would disprove it. Plus ranked paths, kill criteria, and a this-week validation plan. Claims are labeled observed, founder-reported, or assumed. Shareable Monetization Brief included.",
    pitchShort:
      "URL in → hard commercial answer, evidence grades, kill criteria, shareable brief.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "buyers",
    label: "Daily Market Research",
    short: "Research",
    outcome: "Find where demand is showing up today",
    beat: "Scan 25+ public communities for buyer conversations before inventing personas.",
    pitch:
      "Daily Market Research searches 25+ public communities (Reddit, HN, Stack Overflow, GitHub, Product Hunt, Indie Hackers, DEV, YouTube, G2, and more) for pain and purchase-intent language. Buyer Stress Test war-games hostile buyers before you burn outreach — unique to Make it RAIN. Rank why each signal matters and draft outreach you approve. Warm network first. Optional Apollo matches.",
    pitchShort:
      "25+ communities + Buyer Stress Test before you burn outreach.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "pricing",
    label: "Pricing Builder",
    short: "Price",
    outcome: "Stop guessing what to charge",
    beat: "Create a price you can explain, defend, and test.",
    pitch:
      "Build a defensible model with ranges, a sweet spot, value anchors, and willingness-to-pay logic tied to your product. Get packaging tradeoffs and a concrete pricing experiment instead of a number that “feels fair.” Your price flows into offers, first-dollar path, and template fill across the system.",
    pitchShort:
      "Defensible price, packaging, and a test you can run. Flows into offers across the system.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "library",
    label: "Offer & page starters",
    short: "Starters",
    outcome: "Ship pages and emails without a blank page",
    beat: "Fill proven templates with your product and publish this week.",
    pitch:
      "Stop staring at empty docs. Proven landing, email, and listing templates fill with your product, buyers, and price so the copy already sounds like you. Copy or download and ship this week instead of rewriting the same page from scratch.",
    pitchShort:
      "Landing, email, and listing templates filled with your product, buyers, and price.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "funnel",
    label: "Funnel Architect",
    short: "Funnel",
    outcome: "Turn attention into customers",
    beat: "Map a practical path from visitor to paying customer.",
    pitch:
      "Map tripwire → core offer → profit maximizer with stage copy and a motion that fits how you sell (outbound, product-led, or hybrid). Leave with a smallest paid offer and a clear path from visitor to paid yes. Jump straight into sales scripts and distribution when you are ready to run it.",
    pitchShort:
      "Tripwire → core → upsell with stage copy and a smallest paid offer path.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "traffic",
    label: "Get Eyes on Your Offer",
    short: "Traffic",
    outcome: "Get in front of the right people",
    beat: "Choose where to show up and what to say.",
    pitch:
      "Rank channels by fit for your buyer and calendar, not a generic “post more” list. Get a Mon–Fri distribution sprint with copy-ready posts and outreach sized for founders without a big ad budget. Hand off into Post Writer, Newsletter Writer, and DM Writer so attention turns into conversations.",
    pitchShort:
      "Channel picks plus a Mon–Fri sprint with copy-ready posts. No big ad budget required.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "launch",
    label: "30-Day Launch Plan",
    short: "Launch",
    outcome: "Stop launching with no plan",
    beat: "Get one clear action per day until you are live.",
    pitch:
      "Get one concrete action per day for 30 days: offer, pages, outreach, and go-live milestones, not a vague launch checklist. Outreach days can pull real lead matches so you are not inventing who to contact. Finish the month knowing what shipped and what still needs a paid yes.",
    pitchShort:
      "One concrete action per day for 30 days, including outreach with real lead matches.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "content",
    label: "Post & Newsletter Writer",
    short: "Writing",
    outcome: "Posts and newsletters personalized to your product",
    beat: "Ship copy customized for your audience — not generic AI filler.",
    pitch:
      "Post Writer and Newsletter Writer turn your product brief into network-native posts (LinkedIn, Meta, X, YouTube, TikTok, Reddit, Google Ads, and more) plus a short email sequence. Ad Poster generates placement-sized creatives. Every draft is personalized to your product and audience.",
    pitchShort:
      "Posts, newsletters, and ad posters tailored to the networks you advertise on.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "progress",
    label: "Momentum & next move",
    short: "Momentum",
    outcome: "Know the next money move this week",
    beat: "Track the path to first revenue and jump to the next action.",
    pitch:
      "See your path to first revenue in one place: milestones, assets you already built, and the next money move. The first-dollar path pulls from revenue, funnel, and analyzer so you are not guessing which tab to open. One click jumps you to the tool that unblocks paid progress.",
    pitchShort:
      "First-revenue path, next money move, and one-click jumps to the right tool.",
    tier: "growth",
    phase: "measure",
  },
  {
    id: "strategy",
    label: "Strategy Tools",
    short: "Strategy",
    outcome: "Stop guessing the next move",
    beat: "Sharpen competitors, pricing, and experiments.",
    pitch:
      "Four operator lenses in one place: competitors, pricing optimization, roadmap, and A/B tests. Enrich named competitors with real firmographics, then download each memo as markdown. Use it when you need sharper moves than another feature sprint.",
    pitchShort:
      "Competitors, pricing, roadmap, and A/B tests with downloadable memos.",
    tier: "pro",
    phase: "measure",
  },
  {
    id: "sales",
    label: "DM Writer",
    short: "DMs",
    outcome: "Personalized DMs that get replies",
    beat: "Messages customized to your product and each recipient type.",
    pitch:
      "DM Writer produces openers, follow-ups, and objection replies personalized to your product and who you are messaging. Proven short length, one ask, peer tone — not script-farm spam. Export and pull live lead matches when ready to send.",
    pitchShort:
      "DM Writer: personalized to product + recipient. Openers, follow-ups, objections.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "results",
    label: "What's Working",
    short: "Results",
    outcome: "Learn from what buyers actually did",
    beat: "Contacts, replies, and revenue update the next recommendation.",
    pitch:
      "Results is the brain: log outreach contacts, replies, visitors, signups, sales, and revenue. Diagnosis of what is working, where the funnel leaks, and what to test next. If Reddit produces conversations and LinkedIn does not, the system should learn that. Jump from the bottleneck into Buyers, Pricing, DM Writer, or Post & Newsletter Writer.",
    pitchShort:
      "Log contacts, replies, and revenue. Recommendations follow evidence.",
    tier: "pro",
    phase: "measure",
  },
  {
    id: "revenue",
    label: "Ways to Get Paid",
    short: "Revenue",
    outcome: "Add more ways to get paid",
    beat: "Open another path for money to hit your account.",
    pitch:
      "Compare revenue models for your product, pick what to build first, and see unit economics with assumptions labeled honestly. Walk away with a first-dollar path: offer, price, who, channel, and ask. Open another way for money to hit your account without rebuilding the whole business.",
    pitchShort:
      "Compare models, unit economics, and a first-dollar path to build next.",
    tier: "pro",
    phase: "scale",
  },
  {
    id: "dfy",
    label: "Done-For-You",
    short: "DFY",
    outcome: "Hand off the hard asset",
    beat: "Let the team build one asset you should not do alone.",
    pitch:
      "Queue one custom asset per month for the team when you should not DIY the hard piece. Instantly download a brief already enriched with your product, buyer target, and price so the handoff is sharp on day one. You keep ownership of the product; we help ship the commercial asset.",
    pitchShort:
      "Queue one custom asset/month. Instant brief from your product, buyer, and price.",
    tier: "pro",
    phase: "scale",
  },
  {
    id: "premium",
    label: "Premium Library",
    short: "Premium",
    outcome: "Use proven sales assets",
    beat: "Open swipe files behind serious outreach and closes.",
    pitch:
      "Open premium swipe files and sales assets filled with your buyers and pricing, not generic templates. Built for serious outreach and closes when starter pages are not enough. Copy, adapt, and ship assets that already speak your offer.",
    pitchShort:
      "Premium swipe files filled with your buyers and pricing for serious outreach.",
    tier: "pro",
    phase: "scale",
  },
];

export const PHASE_LABELS: Record<JourneyPhase, string> = {
  plan: "Plan",
  execute: "Execute",
  measure: "Measure",
  scale: "Scale",
};

const VISITED_KEY = "rain-journey-visited";

export function loadVisitedSteps(): Set<JourneyTabId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed.filter(Boolean) as JourneyTabId[]);
  } catch {
    return new Set();
  }
}

export function markStepVisited(id: JourneyTabId): Set<JourneyTabId> {
  const next = loadVisitedSteps();
  next.add(id);
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...next]));
  } catch {
    /* ignore quota */
  }
  return next;
}

/** Which slices are "eaten" based on saved assets + soft visits. */
export function getSliceCompletion(
  data: JourneyCompletionSource,
  visited: Set<JourneyTabId>
): Record<JourneyTabId, boolean> {
  return {
    analyzer: Object.keys(data.initialAnalyses).length > 0,
    buyers: !!data.initialBuyers,
    pricing: Object.keys(data.initialPricings).length > 0,
    library: visited.has("library"),
    funnel: !!data.initialFunnel,
    traffic: !!data.initialTraffic,
    launch: !!data.initialLaunch,
    content: !!data.initialBundle,
    progress: Object.values(data.initialProgress).some(Boolean),
    strategy: Object.keys(data.initialStrategy).length > 0,
    sales: !!data.initialSalesKit,
    results:
      data.metricsEntries.length > 0 || !!data.initialMetricsAnalysis,
    revenue: !!data.initialRevenue,
    dfy: data.dfyRequests.length > 0,
    premium: visited.has("premium"),
  };
}

export function countCompleted(
  completion: Record<JourneyTabId, boolean>
): number {
  return JOURNEY_STEPS.filter((s) => completion[s.id]).length;
}

export interface NextBestAction {
  step: JourneyStep;
  index: number;
  reason: string;
  /** True when the suggested step is locked by tier */
  locked: boolean;
}

/**
 * First incomplete unlocked slice in order.
 * If every unlocked slice is done, point at the next locked slice (upgrade).
 * If the whole pie is done, celebrate on the last step.
 */
export function getNextBestAction(
  completion: Record<JourneyTabId, boolean>,
  isUnlocked: (tier: TierName) => boolean
): NextBestAction {
  for (let i = 0; i < JOURNEY_STEPS.length; i++) {
    const step = JOURNEY_STEPS[i];
    if (!completion[step.id] && isUnlocked(step.tier)) {
      return {
        step,
        index: i,
        reason: step.beat,
        locked: false,
      };
    }
  }

  for (let i = 0; i < JOURNEY_STEPS.length; i++) {
    const step = JOURNEY_STEPS[i];
    if (!completion[step.id]) {
      return {
        step,
        index: i,
        reason: `Unlock ${step.tier === "pro" ? "Pro" : "Growth"} to continue the pie.`,
        locked: true,
      };
    }
  }

  const last = JOURNEY_STEPS[JOURNEY_STEPS.length - 1];
  return {
    step: last,
    index: JOURNEY_STEPS.length - 1,
    reason: "Pie complete. You built the path. Now go enjoy the business.",
    locked: false,
  };
}

export function stepIndex(id: JourneyTabId): number {
  return JOURNEY_STEPS.findIndex((s) => s.id === id);
}

export function adjacentStep(
  id: JourneyTabId,
  dir: -1 | 1
): JourneyStep | null {
  const i = stepIndex(id);
  const next = JOURNEY_STEPS[i + dir];
  return next ?? null;
}
