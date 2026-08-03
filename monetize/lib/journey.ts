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
    outcome: "Stop building what nobody wants",
    beat: "Stress-test the opportunity before you invest more time.",
    pitch:
      "Paste a product URL or brief and get a commercial score with confidence, ranked revenue paths, kill criteria, and a this-week validation plan. Claims are labeled observed, founder-reported, or assumed so you know evidence from guesswork. Export a shareable Monetization Brief for cofounders and advisors.",
    pitchShort:
      "URL or brief in → commercial score, evidence grades, kill criteria, and a shareable Monetization Brief.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "buyers",
    label: "Find Your Buyers",
    short: "Buyers",
    outcome: "Find the people most likely to pay",
    beat: "Identify audiences with a real reason to purchase.",
    pitch:
      "Get ideal-buyer profiles with pain, budget signal, objections, and positioning lines you can actually use. See who to message first, then search live people matches so outreach targets real humans, not a vague “target market.” Those buyers seed funnel, traffic, sales, and content so the whole system stays aligned.",
    pitchShort:
      "ICP profiles, objections, and live people matches you can message. Seeds the rest of the system.",
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
      "Rank channels by fit for your buyer and calendar, not a generic “post more” list. Get a Mon–Fri distribution sprint with copy-ready posts and outreach sized for founders without a big ad budget. Hand off into content packs and sales kits so attention turns into conversations.",
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
    label: "Content Generator",
    short: "Content",
    outcome: "Stop staring at a blank content calendar",
    beat: "Ship a Mon–Fri publish order from one idea.",
    pitch:
      "Turn one idea into LinkedIn/X posts, ads, listing copy, and emails seeded from your big promise and buyer positioning. Get a Mon–Fri publish order you can run this week without a content team. Pair it with the traffic sprint so every post has a place to land.",
    pitchShort:
      "One idea → posts, emails, listings, plus a Mon–Fri publish order.",
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
    label: "Direct Sales Tools",
    short: "Sales",
    outcome: "Start conversations that can close",
    beat: "Send messages that open real sales conversations.",
    pitch:
      "Get openers, follow-ups, objection handlers, and a call agenda tuned to your buyer and channel, without sounding like a script farm. See a clear first-dollar ask, export openers to CSV, and pull live lead matches when you are ready to send. Built for founders who sell themselves.",
    pitchShort:
      "Openers, follow-ups, objections, first-dollar ask, and live lead matches.",
    tier: "pro",
    phase: "measure",
  },
  {
    id: "results",
    label: "What's Working",
    short: "Results",
    outcome: "See what's leaking and fix it",
    beat: "Find the leak and double down on what converts.",
    pitch:
      "Log weekly visitors, signups, sales, and revenue, then get a diagnosis of what is working, where the funnel leaks, and what to test next. Jump from the bottleneck straight into traffic, sales, funnel, or content. Export the analysis so your next week is driven by numbers, not vibes.",
    pitchShort:
      "Log weekly numbers, find the leak, and jump to the tool that fixes it.",
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
