/**
 * Anonymized live Founder Briefs safe to share publicly.
 * Same production-quality Founder Briefs as private client delivery;
 * founder + company names scrubbed to ████████ on the /r/ pages.
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

/** Short “how / why” for homepage, DMs, newsletters. */
export const PUBLIC_EXAMPLES_WHY = {
  headline: "See a real brief (names redacted)",
  how: "These are the same First Customer Path briefs we deliver privately: Analyzer + Buyer Stress Test + Full Brief, run on live product URLs. Watch an original offer get attacked, then rewritten. Only founder and company names are covered.",
  why: "A plan you can get free. Proof is the transformation: original offer → Stress Test objection → rewritten offer.",
  cta: "Open an example, then run yours free.",
};
