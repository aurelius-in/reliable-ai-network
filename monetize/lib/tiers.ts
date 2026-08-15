export type TierName = "starter" | "growth" | "pro";

export interface TierInfo {
  id: TierName;
  name: string;
  price: number;
  tagline: string;
  /** Short value + when-to-pick line shown above the price */
  summary: string;
  features: string[];
  /** Standout upgrade value shown after the checklist (Growth / Pro) */
  starValue?: string;
  highlight?: boolean;
}

export const TIERS: TierInfo[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    tagline: "Find who may pay and get the offer ready",
    summary:
      "First Customer Path: who may pay, Buyer Stress Test before you burn DMs, a price to test, and the next conversation worth your hour.",
    features: [
      "Hard commercial answer (buyer, pain, smallest paid offer)",
      "Buyer Stress Test: survive 5 hard buyer conversations before outreach",
      "Who to approach this week (warm first; public signals when they help)",
      "Outreach drafts you approve before send",
      "Price and packaging hypotheses to test",
      "4 tools underneath this job",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    tagline: "Reach them and run the work",
    summary:
      "The next message no longer starts from a blank page. Writers, pipeline, and site fixes on the same brief. You still approve before anything sends.",
    features: [
      "Everything in Starter, plus:",
      "Post Writer: network-native drafts (LinkedIn, Meta, X, YouTube, TikTok…)",
      "Newsletter Writer: email that feels 1:1, not blast",
      "Ad Poster: creatives sized for Feed, Stories, Shorts, Display",
      "DM Writer: openers and follow-ups per recipient type",
      "Pipeline: stop forgetting who replied and why they objected",
      "Site Optimize: stop sending traffic to an offer that dies on arrival",
      "Funnel + 30-day launch calendar",
      "9 tools underneath this job",
    ],
    starValue:
      "Run the work: write, send prep, pipeline, site. Then learn.",
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    tagline: "Learn what closes and keep improving the next move",
    summary:
      "A reply should change who you sell to, what you charge, or what you do next. Results compounds. Optional specialist handoff when you want execution help.",
    highlight: true,
    features: [
      "Everything in Growth, plus:",
      "Results: contacts, replies, revenue → next fix",
      "Competitor scan, pricing tests, and 90-day plan",
      "Extra revenue models ranked for you",
      "One optional execution handoff per month",
      "Premium swipe files + priority support",
      "15 tools underneath this job",
    ],
    starValue:
      "Month three should be more valuable than month one. That is the keep-pay job.",
  },
];

export function tierLabel(tier: string | null | undefined): string {
  switch (tier) {
    case "starter":
      return "Starter";
    case "growth":
      return "Growth";
    case "pro":
      return "Pro";
    default:
      return "Free";
  }
}

const TIER_RANK: Record<TierName, number> = { starter: 1, growth: 2, pro: 3 };

/** True when the user's current tier includes the tools of `required`. */
export function hasTierAccess(
  currentTier: string | null | undefined,
  required: TierName
): boolean {
  const rank = TIER_RANK[currentTier as TierName] ?? 0;
  return rank >= TIER_RANK[required];
}

export function trialDaysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
