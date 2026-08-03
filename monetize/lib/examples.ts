/**
 * One-tap example products for demos. Oriented to B2B / serious software
 * founders — not consumer hobby apps.
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
    id: "ops-copilot",
    emoji: "",
    title: "Ops Copilot",
    type: "saas",
    description:
      "B2B workflow copilot that turns SOPs and ticket history into draft runbooks and exception alerts for mid-market operations teams. Sold as annual SaaS to Ops and RevOps leaders who already run Zendesk or ServiceNow.",
  },
  {
    id: "compliance-vault",
    emoji: "",
    title: "Compliance Vault",
    type: "saas",
    description:
      "Document control and audit-evidence workspace for Series A–B SaaS companies preparing SOC 2. Buyers are Heads of Security and founder-CEOs who need evidence packs without hiring a full GRC team.",
  },
  {
    id: "dev-metrics",
    emoji: "",
    title: "Ship Signal",
    type: "tool",
    description:
      "Engineering productivity and delivery-risk dashboard that pulls from GitHub and Jira for VP Eng and CTO buyers at 20–200 person product companies. Positioned as decision support for roadmap capacity, not vanity velocity scores.",
  },
  {
    id: "revenue-desk",
    emoji: "",
    title: "Revenue Desk",
    type: "saas",
    description:
      "Deal desk assistant that drafts pricing exceptions, discount guardrails, and approval packets from CRM notes for B2B SaaS with $15k–$80k ACV. Buyers are CRO / RevOps who want fewer ad-hoc discount fights.",
  },
];

/* ------------------------------------------------------------------ */
/* Chip options shared by tools (audience, tone, price, goals)         */
/* ------------------------------------------------------------------ */

export const AUDIENCE_OPTIONS = [
  { value: "B2B SaaS buyers", label: "B2B SaaS" },
  { value: "enterprise IT and security", label: "Enterprise IT / Sec" },
  { value: "SMB operators", label: "SMB operators" },
  { value: "developers and technical teams", label: "Developers" },
  { value: "agencies and consultancies", label: "Agencies" },
  { value: "internal ops and RevOps", label: "Ops / RevOps" },
];

export const TONE_OPTIONS = [
  { value: "direct and executive", label: "Executive / direct" },
  { value: "technical and precise", label: "Technical" },
  { value: "consultative and calm", label: "Consultative" },
  { value: "bold and commercial", label: "Commercial" },
];

export const PRICE_BAND_OPTIONS = [
  { value: "smb", label: "SMB ($29–$199/mo)" },
  { value: "mid-market", label: "Mid-market ($200–$2k/mo)" },
  { value: "enterprise", label: "Enterprise ($10k+ ACV)" },
];

export const GOAL_OPTIONS = [
  { value: "first paying customers", label: "First paying customers" },
  { value: "repeatable pipeline", label: "Repeatable pipeline" },
  { value: "raise ACV and close rate", label: "Raise ACV / close rate" },
];

export const TIME_PER_WEEK_OPTIONS = [
  { value: "2-3 hours a week", label: "2–3 hrs/week" },
  { value: "5-7 hours a week", label: "5–7 hrs/week" },
  { value: "10+ hours a week", label: "10+ hrs/week" },
];

export const COMFORT_OPTIONS = [
  { value: "prefers written outbound over video", label: "Written outbound" },
  { value: "comfortable on founder calls and demos", label: "Founder-led demos" },
  { value: "strong on LinkedIn and email", label: "LinkedIn + email" },
  { value: "prefers partner or AE-assisted sales", label: "Partner / AE-assisted" },
];

export const OUTREACH_CHANNEL_OPTIONS = [
  { value: "cold email", label: "Cold email" },
  { value: "LinkedIn messages", label: "LinkedIn" },
  { value: "warm intro and partner channels", label: "Warm intro / partners" },
];

export const TARGET_BUYER_OPTIONS = [
  { value: "economic buyers (VP / C-level)", label: "Economic buyer (VP/C)" },
  { value: "technical champions", label: "Technical champion" },
  { value: "SMB owners and operators", label: "SMB owners" },
  { value: "startup founders and teams", label: "Startup teams" },
];

/** Rotating copy for loading states — operator tone. */
export const LOADING_LINES = [
  "Building the commercial brief…",
  "Stress-testing positioning and price…",
  "Mapping buyers and objections…",
  "Checking assumptions against your description…",
  "Drafting the next validation steps…",
  "Compiling recommendations…",
];
