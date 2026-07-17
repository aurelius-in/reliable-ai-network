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
    tagline: "Quick wins & the basics",
    features: [
      "Idea Analyzer with monetization score",
      "Pricing & Packaging Builder",
      "Quick-Start template library",
      "Unlimited re-runs on your creations",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 50,
    tagline: "Funnels & content at scale",
    features: [
      "Everything in Starter",
      "Funnel Architect (tripwire → core → upsell)",
      "Ad & Content Generator",
      "Progress Tracker + community wall",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 100,
    tagline: "The full monetization OS",
    highlight: true,
    features: [
      "Everything in Growth",
      "Advanced strategy tools & roadmaps",
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

export function trialDaysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
