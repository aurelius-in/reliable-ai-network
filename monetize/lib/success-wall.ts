/**
 * Illustrative example plays for the Progress Tracker tab.
 * Static scenarios — not customer testimonials or measured results.
 */

export interface SuccessStory {
  name: string;
  product: string;
  emoji: string;
  win: string;
  detail: string;
  timeframe: string;
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    name: "Maya, 19",
    product: "AI flashcard app",
    emoji: "📚",
    win: "First $120 from her study app",
    detail:
      "Priced it at $4.99/mo after the Pricing Builder showed students happily pay for exam help. Her tripwire: a $1 'finals week' cram pack.",
    timeframe: "3 weeks after launch",
  },
  {
    name: "Devon",
    product: "Discord trivia bot",
    emoji: "🎮",
    win: "42 servers paying $5/mo",
    detail:
      "Used the Funnel Architect to add a free tier that hooks servers, then upsells premium game packs to the most active ones.",
    timeframe: "2 months in",
  },
  {
    name: "Priya",
    product: "Notion template pack",
    emoji: "🗂️",
    win: "$860 launch weekend on Gumroad",
    detail:
      "Generated her whole listing and a 5-email launch sequence with the Content Generator. The value-stack listing tripled her conversion rate.",
    timeframe: "Launch weekend",
  },
  {
    name: "Sam & Alex",
    product: "AI headshot tool",
    emoji: "📸",
    win: "Landed a $1,500 licensing deal",
    detail:
      "The Idea Analyzer flagged licensing to recruiters as their highest-revenue path. They emailed 10 agencies — one said yes.",
    timeframe: "6 weeks in",
  },
  {
    name: "Jordan",
    product: "Bedtime story generator",
    emoji: "🧙",
    win: "First 100 subscribers",
    detail:
      "Followed the 30/60/90 roadmap: parents' Facebook groups first, then a $2 story-pack tripwire, then the $6/mo unlimited plan.",
    timeframe: "90 days",
  },
  {
    name: "Lena",
    product: "AI meal planner",
    emoji: "🍳",
    win: "$300/mo and growing",
    detail:
      "A/B tested her headline exactly like the Strategy Tools suggested. The winner ('Dinner solved in 10 seconds') doubled signups.",
    timeframe: "Month 3",
  },
];
