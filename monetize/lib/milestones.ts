/**
 * Path-to-revenue checklist for Momentum & next move.
 */

export interface Milestone {
  id: string;
  label: string;
  helper: string;
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: "analyzed_idea",
    label: "Lock a hard commercial answer",
    helper:
      "Primary buyer, valuable pain, smallest paid offer, and honesty if the wedge is unclear.",
    emoji: "💡",
  },
  {
    id: "named_buyers",
    label: "Run Demand Radar",
    helper:
      "Rank public conversations showing the pain. Personas stay hypotheses until you talk to people.",
    emoji: "🎯",
  },
  {
    id: "built_pricing",
    label: "Set a defensible price",
    helper: "Pick a model, sweet spot, and a pricing experiment tied to market signals.",
    emoji: "🏷️",
  },
  {
    id: "built_funnel",
    label: "Map the path to paid",
    helper: "Tripwire → core offer → upsell (or your B2B equivalent).",
    emoji: "🌀",
  },
  {
    id: "created_content",
    label: "Create launch messaging",
    helper: "Posts and emails from real buyer pain language, not generic topics.",
    emoji: "📣",
  },
  {
    id: "first_outreach",
    label: "Run a First Customer Sprint",
    helper:
      "~10 credible opportunities + outreach you approve. Log replies in Results.",
    emoji: "📢",
  },
  {
    id: "first_dollar",
    label: "Get the first paying customer",
    helper: "The hardest dollar. Proof the offer works with a real buyer.",
    emoji: "💵",
  },
  {
    id: "first_100",
    label: "Reach $100 total",
    helper: "Repeat what worked. Now it is a system, not a fluke.",
    emoji: "💰",
  },
];
