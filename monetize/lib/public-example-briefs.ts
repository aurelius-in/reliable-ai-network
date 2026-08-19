/**
 * Anonymized live Founder Briefs safe to share publicly.
 * Same production-quality Founder Briefs as private client delivery;
 * founder + company names scrubbed to ████████ on the /r/ pages.
 *
 * Homepage merchandises Standard Founder Brief vs Pro Review.
 * Example C remains public at its /r/ URL; it is just not on the homepage.
 */

export type PublicExampleBrief = {
  id: string;
  label: string;
  category: string;
  href: string;
  blurb: string;
};

export const PUBLIC_EXAMPLE_BRIEFS: PublicExampleBrief[] = [
  {
    id: "A",
    label: "Example A",
    category: "Pet health / records SaaS",
    href: "https://makeitrainapp.com/r/3e8c70e39bd350961d9c0a88e7182e9b323f",
    blurb:
      "Original offer got attacked in Buyer Stress Test (fragile / 4). Rewritten who-may-pay and this-week moves on a live product URL. Founder and company names redacted.",
  },
  {
    id: "C",
    label: "Example C",
    category: "AI content ops SaaS",
    href: "https://makeitrainapp.com/r/b464a9702a86973e5c304f99fa208ab5956e",
    blurb:
      "Same Full Brief depth: who may pay, smallest paid offer, and where free AI still kills the pitch before outreach.",
  },
];

export const STANDARD_FOUNDER_BRIEF_SAMPLE = PUBLIC_EXAMPLE_BRIEFS.find(
  (brief) => brief.id === "A"
) as PublicExampleBrief;

/** Hosted redacted sample. Do not treat page count as a product promise. */
export const PRO_REVIEW_SAMPLE_HREF =
  "/reports/make-it-rain-pro-review-redacted.pdf";

/**
 * Condensed homepage previews from real redacted documents.
 * Standard: live Founder Brief at STANDARD_FOUNDER_BRIEF_SAMPLE.href
 * Pro: public/reports/make-it-rain-pro-review-redacted.pdf (15 August 2026)
 * Identifying names stay redacted. Do not invent findings or metrics.
 */
export const STANDARD_BRIEF_PREVIEW = {
  kicker: "Make it RAIN · First Customer Path",
  title: "████████",
  subtitle: "Monetization Brief",
  stressLabel: "Stress test",
  stressVerdict: "fragile",
  whoMayPayLabel: "Who may pay first",
  whoMayPay:
    "Dog or cat parent who boards, sits, or travels and must show vaccine proof on short notice",
  bstLabel: "Buyer Stress Test",
  bstExcerpt:
    "Parents like the idea until they realize a calendar, camera roll, and their vet portal already do 80 percent of this for free.",
  nextLabel: "Next conversation",
  nextExcerpt:
    "Talk to: Multi-pet or multi-clinic dog/cat parents who board, use daycare, or travel and have been asked for clean vaccine proof more than once.",
  rewriteLabel: "Paid offer",
  rewriteExcerpt:
    "████████ Plus: scan or import vaccine records once, auto-build a boarding-ready multi-vaccine PDF, share link or file with sitter/boarder, and get booster reminders.",
} as const;

export const PRO_REVIEW_PREVIEW = {
  kicker: "Independent product & architecture assessment",
  title: "████████ Pro Review",
  prepared: "Prepared 15 August 2026  |  Version 1.0",
  preparedForLabel: "Prepared for",
  verdictLabel: "Core verdict",
  verdict: "The strongest wedge is not the graph. It is safer change.",
  ladderLabel: "Evidence ladder",
  observedLabel: "Observed",
  observed: "The product surface already supports a change-safety workflow.",
  inferenceLabel: "Inference",
  inference:
    "The highest-frequency user may be the coding agent plus reviewer, while the economic buyer is an engineering/platform owner.",
  recLabel: "Recommendation",
  rec: "Position around safer changes and known blast radius before leading with diagram count, tool count, or visualization.",
} as const;

/** Short “how / why” for homepage, DMs, newsletters. */
export const PUBLIC_EXAMPLES_WHY = {
  headline: "See what free gives you. See how much deeper Pro goes.",
  how: "Start with a focused First Customer Path. When the decision needs a closer look, a Make it RAIN Pro Review goes further into who may pay, what is still unproven, what could fail, and what to test next.",
  why: "The free brief is already a hard commercial starting point. Pro is more rigor when the decision needs it, not a weaker free tier.",
  cta: "Open a sample, then run yours free.",
};
