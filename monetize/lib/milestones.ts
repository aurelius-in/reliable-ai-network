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
    label: "Score the opportunity",
    helper: "Run the commercial opportunity brief so you know paths and kill criteria.",
    emoji: "💡",
  },
  {
    id: "named_buyers",
    label: "Name who will pay",
    helper: "Lock ideal buyers and where to reach them before you write more code.",
    emoji: "🎯",
  },
  {
    id: "built_pricing",
    label: "Set a defensible price",
    helper: "Pick a model, sweet spot, and a pricing experiment you can run.",
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
    helper: "Posts, emails, and listing copy ready to publish this week.",
    emoji: "📣",
  },
  {
    id: "first_outreach",
    label: "Start real conversations",
    helper: "Send outreach or publish where buyers already pay attention.",
    emoji: "📢",
  },
  {
    id: "first_dollar",
    label: "Make the first $1",
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
