export type TierName = "starter" | "growth" | "pro";

export interface TierInfo {
  id: TierName;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export const TIERS: TierInfo[] = [
  {
    id: "starter",
    name: "Starter",
    price: 20,
    tagline: "Quick wins & the basics — 4 tools",
    features: [
      "Idea Analyzer with monetization score",
      "Find Your Buyers — ideal customer profiles",
      "Pricing & Packaging Builder",
      "Quick-Start template library",
      "Unlimited re-runs on your creations",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 50,
    tagline: "Funnels, traffic & launch — 9 tools",
    features: [
      "Everything in Starter (4 tools), plus:",
      "Funnel Architect (tripwire → core → upsell)",
      "Get Eyes on Your Offer — traffic engine",
      "30-Day Launch Plan with daily scripts",
      "Ad & Content Generator",
      "Progress Tracker + community wall",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 100,
    tagline: "The full monetization OS — all 15 tools",
    highlight: true,
    features: [
      "Everything in Growth (9 tools), plus:",
      "Advanced strategy tools & roadmaps",
      "Direct Sales Tools — outreach & scripts",
      "What's Working — results dashboard + AI optimizer",
      "Multiple Ways to Get Paid — revenue planner",
      "Done-for-you monthly custom asset",
      "Priority support + premium swipe files",
    ],
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
