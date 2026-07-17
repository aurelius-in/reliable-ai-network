/**
 * The launch-journey milestone checklist shown in the Progress Tracker.
 * Completion state is persisted per-user in the `progress_logs` table,
 * keyed by the milestone `id` string.
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
    label: "Analyze my first idea",
    helper: "Run the Idea Analyzer so you know your best money paths.",
    emoji: "💡",
  },
  {
    id: "built_pricing",
    label: "Pick my price",
    helper: "Use the Pricing Builder to choose a price that feels fair and pays you well.",
    emoji: "🏷️",
  },
  {
    id: "built_funnel",
    label: "Build my funnel",
    helper: "Tripwire → core offer → upsell. The Funnel Architect writes it for you.",
    emoji: "🌀",
  },
  {
    id: "created_content",
    label: "Create launch content",
    helper: "Generate posts, ads, and emails with the Content Generator.",
    emoji: "📣",
  },
  {
    id: "published_page",
    label: "Publish my product page",
    helper: "Put your offer live on Gumroad, an app store, or your own site.",
    emoji: "🌐",
  },
  {
    id: "shared_publicly",
    label: "Tell people about it",
    helper: "Post about your product somewhere real people will see it.",
    emoji: "📢",
  },
  {
    id: "first_dollar",
    label: "Make my first $1",
    helper: "The hardest dollar you'll ever earn — and the most important.",
    emoji: "💵",
  },
  {
    id: "first_100",
    label: "Reach $100 total",
    helper: "Proof this is real. Now it's about repeating what worked.",
    emoji: "💰",
  },
];
