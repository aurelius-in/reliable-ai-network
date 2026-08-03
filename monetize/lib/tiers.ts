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
    tagline: "Quick wins & the basics — 4 tools",
    summary:
      "Know the offer. Best when you're still validating idea, buyers, and price.",
    features: [
      "Money score + best revenue paths",
      "Buyer profiles + Apollo people-search matches",
      "Price & packaging recommendations to test",
      "Starter play templates to begin this week",
      "Unlimited re-runs on your creations",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    tagline: "Funnels, traffic & launch — 9 tools",
    summary:
      "Ship the go-to-market. Best when you're ready to launch and get eyes on it.",
    features: [
      "Everything in Starter (4 tools), plus:",
      "Funnel written: first offer → core → upsell",
      "Where to promote + posts ready to publish",
      "30-day launch calendar with daily scripts",
      "Ads, posts, listing & email sequence",
      "Progress milestones + example plays",
    ],
    starValue:
      "The real upgrade: turn clarity into a launch people can buy.",
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    tagline: "The full monetization OS — all 15 tools",
    summary:
      "Close, measure, and scale. Best when you need pipeline and leverage.",
    highlight: true,
    features: [
      "Everything in Growth (9 tools), plus:",
      "Competitor scan, pricing tests & 90-day plan",
      "Cold DMs, follow-ups & objection scripts",
      "Weekly results + what to fix next",
      "Extra revenue models ranked for you",
      "One custom asset request per month (queued)",
      "Premium swipe files + priority support",
    ],
    starValue:
      "The real upgrade: sell, optimize, and scale what Growth only launches.",
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
