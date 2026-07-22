/**
 * Linear monetization journey — 15 tools as pie slices.
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
  /** One short line for the story / next-action card */
  beat: string;
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
    beat: "See what your idea could earn — and where the money is.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "buyers",
    label: "Find Your Buyers",
    short: "Buyers",
    beat: "Name the people who will actually pay.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "pricing",
    label: "Pricing Builder",
    short: "Price",
    beat: "Pick a price that feels fair and pays you.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "library",
    label: "Quick-Start Library",
    short: "Library",
    beat: "Steal a proven play you can run this week.",
    tier: "starter",
    phase: "plan",
  },
  {
    id: "funnel",
    label: "Funnel Architect",
    short: "Funnel",
    beat: "Map how a stranger becomes a customer.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "traffic",
    label: "Get Eyes on Your Offer",
    short: "Traffic",
    beat: "Choose where to show up — and what to post.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "launch",
    label: "30-Day Launch Plan",
    short: "Launch",
    beat: "One clear action per day until you're live.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "content",
    label: "Content Generator",
    short: "Content",
    beat: "Turn one idea into posts, ads, and emails.",
    tier: "growth",
    phase: "execute",
  },
  {
    id: "progress",
    label: "Progress Tracker",
    short: "Progress",
    beat: "Log what you tried. Watch the pie fill.",
    tier: "growth",
    phase: "measure",
  },
  {
    id: "strategy",
    label: "Strategy Tools",
    short: "Strategy",
    beat: "Sharpen competitors, pricing, and experiments.",
    tier: "pro",
    phase: "measure",
  },
  {
    id: "sales",
    label: "Direct Sales Tools",
    short: "Sales",
    beat: "Send messages that start real conversations.",
    tier: "pro",
    phase: "measure",
  },
  {
    id: "results",
    label: "What's Working",
    short: "Results",
    beat: "Find the leak. Double down on what converts.",
    tier: "pro",
    phase: "measure",
  },
  {
    id: "revenue",
    label: "Ways to Get Paid",
    short: "Revenue",
    beat: "Add another way money can hit your account.",
    tier: "pro",
    phase: "scale",
  },
  {
    id: "dfy",
    label: "Done-For-You",
    short: "DFY",
    beat: "Hand one hard asset to the team.",
    tier: "pro",
    phase: "scale",
  },
  {
    id: "premium",
    label: "Premium Library",
    short: "Premium",
    beat: "Open the swipe files behind serious sales.",
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
    reason: "Pie complete. You built the path — now go enjoy the business.",
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
