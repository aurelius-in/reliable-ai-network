/** Illustrative Monetization Brief for /sample (labeled sample, not a live audit). */

export const SAMPLE_BRIEF = {
  productTitle: "Ops Copilot (sample product)",
  productType: "B2B SaaS",
  stage: "Launched, early revenue",
  description:
    "AI assistant that drafts ops runbooks and incident updates for mid-market SaaS teams. Founders report a waitlist and a handful of design-partner calls; public site emphasizes “enterprise-ready” language.",
  commercialAnswer: {
    primaryBuyer: "Head of Ops / Director of Engineering Ops at 50–300 person SaaS",
    valuablePain:
      "Incident chaos and tribal knowledge; runbooks that are stale when SEVs hit",
    smallestPaidOffer:
      "30-day Ops Copilot pilot at $1,500 with one success metric (MTTR or runbook coverage)",
    wedgeClarity: "narrowing",
    honestyNote:
      "Positioning still drifts toward “enterprise-ready” without enterprise proof. Narrow to ops pilots first.",
    whyThisPath:
      "Founder-reported design partners + observed ops/incident language on the public site; mid-market ops already buys tools this way.",
    whatWouldDisprove:
      "10 qualified discovery calls with zero paid pilots in 30 days",
  },
  score: 62,
  confidence: "medium",
  scoreNote:
    "Secondary signal only. Prefer the hard commercial answer above. Confidence rises with URL evidence and traction detail.",
  evidence: [
    {
      grade: "observed" as const,
      claim: "Public marketing site describes ops/incident workflow and CTA for a demo.",
    },
    {
      grade: "founder_reported" as const,
      claim: "Waitlist + design-partner conversations (entered by founder).",
    },
    {
      grade: "assumed" as const,
      claim: "Willingness-to-pay near $199–$499/mo for mid-market ops leads (inferred; needs a price test).",
    },
  ],
  paths: [
    {
      name: "Pilot + monthly SaaS",
      why: "Matches how ops tools are already bought; smallest paid yes is a 30-day pilot.",
    },
    {
      name: "Implementation workshop",
      why: "Cash sooner; useful if onboarding is heavy, but distracts from product-led loop.",
    },
  ],
  buyers:
    "Primary: Head of Ops / Director of Engineering Ops at 50–300 person SaaS. Pain: incident chaos and tribal knowledge. Objection: “another AI tool that invents runbooks.”",
  price:
    "Test $249/mo annual or $1,500 30-day pilot. Anchor against the cost of one avoided SEV-2 hour. Do not lead with “enterprise custom.”",
  killCriteria: [
    "10 qualified discovery calls with zero paid pilots in 30 days",
    "Prospects ask only for free forever / open-source clone",
  ],
  thisWeek: [
    "Run Demand Radar (HN/Reddit) for incident/ops pain language matching the buyer",
    "Message 15 ops leaders with one incident-pain opener (not feature list)",
    "Offer a paid pilot with a written success metric; log what the market did",
  ],
  firstDollar:
    "Smallest paid offer: 30-day Ops Copilot pilot at $1,500 with one success metric (MTTR or runbook coverage).",
};
