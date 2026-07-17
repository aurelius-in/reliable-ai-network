/**
 * Preloaded, one-tap example data used across every tool so a brand-new
 * (or non-technical) user can try everything without typing a word.
 */

export interface ExampleCreation {
  id: string;
  emoji: string;
  title: string;
  type: string;
  description: string;
}

export const EXAMPLE_CREATIONS: ExampleCreation[] = [
  {
    id: "recipe-app",
    emoji: "🍳",
    title: "AI Recipe App",
    type: "app",
    description:
      "An app where you type the ingredients you have at home and AI instantly creates a step-by-step recipe with photos, portion sizes, and a shopping list for anything missing. Made for busy people and college students who don't know what to cook.",
  },
  {
    id: "study-buddy",
    emoji: "📚",
    title: "AI Study Buddy",
    type: "app",
    description:
      "A study helper that turns class notes or textbook photos into flashcards, practice quizzes, and simple explanations. It quizzes you every day before a test. Made for high school and college students.",
  },
  {
    id: "discord-bot",
    emoji: "🎮",
    title: "Discord Game Bot",
    type: "game",
    description:
      "A Discord bot that runs trivia nights, word games, and daily challenges inside any server, with leaderboards and prizes. Made for gaming communities and friend groups who want their server to be more fun.",
  },
  {
    id: "notion-pack",
    emoji: "🗂️",
    title: "Notion Template Pack",
    type: "content",
    description:
      "A pack of 12 beautiful Notion templates for planning your week, tracking habits, budgeting, and organizing school or work. Made for students and young professionals who love staying organized.",
  },
  {
    id: "headshot-tool",
    emoji: "📸",
    title: "AI Headshot Maker",
    type: "tool",
    description:
      "A tool that turns a few selfies into professional-looking headshots for LinkedIn, resumes, and websites in under five minutes. Made for job seekers and freelancers who don't want to pay a photographer.",
  },
  {
    id: "story-generator",
    emoji: "🧙",
    title: "Bedtime Story Generator",
    type: "app",
    description:
      "An app where parents pick a theme, a hero name, and a lesson, and AI writes a personalized bedtime story with illustrations. Made for parents of kids aged 3 to 9.",
  },
];

/* ------------------------------------------------------------------ */
/* Chip options shared by tools (audience, tone, price, goals)         */
/* ------------------------------------------------------------------ */

export const AUDIENCE_OPTIONS = [
  { value: "students", label: "🎓 Students" },
  { value: "parents", label: "👨‍👩‍👧 Parents" },
  { value: "gamers", label: "🎮 Gamers" },
  { value: "creators", label: "🎨 Creators" },
  { value: "small businesses", label: "🏪 Small businesses" },
  { value: "busy professionals", label: "💼 Busy professionals" },
];

export const TONE_OPTIONS = [
  { value: "friendly and fun", label: "😄 Fun & friendly" },
  { value: "bold and confident", label: "🔥 Bold & confident" },
  { value: "calm and professional", label: "🤝 Professional" },
  { value: "playful and quirky", label: "🎈 Playful" },
];

export const PRICE_BAND_OPTIONS = [
  { value: "budget", label: "💵 Budget ($5–$20)" },
  { value: "mid", label: "💰 Mid ($20–$100)" },
  { value: "premium", label: "💎 Premium ($100+)" },
];

export const GOAL_OPTIONS = [
  { value: "pocket money", label: "🍕 Pocket money" },
  { value: "steady side income", label: "🌱 Side income" },
  { value: "a real business", label: "🚀 Real business" },
];

export const TIME_PER_WEEK_OPTIONS = [
  { value: "2-3 hours a week", label: "⏱️ 2–3 hrs/week" },
  { value: "5-7 hours a week", label: "🕐 5–7 hrs/week" },
  { value: "10+ hours a week", label: "🔥 10+ hrs/week" },
];

export const COMFORT_OPTIONS = [
  { value: "camera-shy, prefers not to show their face", label: "🙈 Camera-shy" },
  { value: "loves writing posts and threads", label: "✍️ Loves writing" },
  { value: "happy to talk on camera or record videos", label: "🎥 Fine on camera" },
  { value: "prefers quiet 1-on-1 conversations over public posting", label: "🤫 Prefers 1-on-1" },
];

export const OUTREACH_CHANNEL_OPTIONS = [
  { value: "Instagram or X DMs", label: "💬 Cold DMs" },
  { value: "cold email", label: "📧 Cold email" },
  { value: "LinkedIn messages", label: "💼 LinkedIn" },
];

export const TARGET_BUYER_OPTIONS = [
  { value: "individual consumers", label: "🧑 Everyday people" },
  { value: "creators and influencers", label: "🎨 Creators" },
  { value: "small business owners", label: "🏪 Small businesses" },
  { value: "startup founders and teams", label: "🚀 Startups" },
];

/** Rotating fun copy for loading states. */
export const LOADING_LINES = [
  "Asking the money brains…",
  "Stealing tricks from top marketers (legally)…",
  "Counting future dollars…",
  "Polishing your big promise…",
  "Making it rain… almost there…",
  "Turning your idea into income…",
];
