import type { SelectVariant } from "./config";

export type VariantCopy = {
  id: SelectVariant;
  label: string;
  eyebrow: string;
  h1: string[];
  support: string;
  cta: string;
  whySelection: string;
};

export const VARIANT_COPY: Record<SelectVariant, VariantCopy> = {
  a: {
    id: "a",
    label: "Selected for leverage",
    eyebrow: "Commercial fit, not status",
    h1: ["We do not take every business.", "We select the ones where 30 days can matter."],
    support:
      "RAIN Select works with established businesses where existing customers, pipeline, pricing, conversion or retention create a credible near-term revenue opportunity. If we do not see enough leverage, we do not take your $1,500.",
    cta: "See If My Business Is Selected",
    whySelection:
      "This is not an application for status. It is a commercial fit decision. We look at the business you already have and decide whether there is enough revenue motion to justify putting operators on the problem now.",
  },
  b: {
    id: "b",
    label: "30-day revenue move",
    eyebrow: "Selected for fit. Focused for 30 days.",
    h1: ["If we select your business,", "give us 30 days to move the revenue number."],
    support:
      "RAIN Select identifies the commercial constraint with the largest credible near-term economic upside and works directly on changing it. We do not accept businesses where a 30-day intervention would be theater.",
    cta: "Apply for Selection",
    whySelection:
      "Your pipeline, customers, pricing, offers, conversion, follow-up and retention tell us whether there is enough to work with. Selected for fit. Focused for 30 days. Measured by commercial movement.",
  },
  c: {
    id: "c",
    label: "Operator selection",
    eyebrow: "Operators, not a dashboard",
    h1: ["Not another agency retainer.", "Not another AI dashboard.", "A business we choose to work on."],
    support:
      "RAIN Select combines commercial intelligence, AI analysis and senior operator judgment to identify what is suppressing revenue and work the highest-value constraint with you.",
    cta: "See If We Select My Business",
    whySelection:
      "We are not trying to collect every account we can. We select situations where operator attention has a credible economic reason to matter.",
  },
  d: {
    id: "d",
    label: "Money already within reach",
    eyebrow: "Before you buy more leads",
    h1: [
      "Before you buy more leads,",
      "find out what your current business should already be producing.",
    ],
    support:
      "RAIN Select chooses businesses where existing pipeline, customers, pricing, conversion or retention suggest there may be meaningful revenue already within reach.",
    cta: "See If My Business Qualifies",
    whySelection:
      "More traffic is expensive when existing revenue is leaking. We look for the shortest credible path from the commercial activity you already have to additional collected revenue.",
  },
};

export const SHARED = {
  whyTitle: "Why do we select clients?",
  whyBody:
    "A 30-day revenue intervention only makes sense when there is already enough commercial motion to work with. We look for businesses with real customers, pipeline, pricing, conversion data, sales activity or expansion opportunities. If the likely upside is too small, the timing is wrong, or there is nothing credible to measure in 30 days, we would rather say no than sell an engagement that should not exist. That is what Select means.",
  examinesTitle: "What we examine",
  examines: [
    "Dead or neglected pipeline",
    "Stalled proposals and weak follow-up",
    "Lead qualification and close rates",
    "Pricing and offer problems",
    "Trial-to-paid leakage",
    "Expansion, renewals, and churn",
    "Channels that produce activity without profitable customers",
    "Trust or proof gaps blocking otherwise qualified buyers",
  ],
  howTitle: "How the 30-Day Revenue Intervention works",
  how: [
    {
      t: "Diagnose",
      d: "We look at the revenue engine you already have, not a generic playbook.",
    },
    {
      t: "Select the constraint",
      d: "We pick the leak with the largest credible near-term upside.",
    },
    {
      t: "Intervene",
      d: "Operators work that constraint with you for 30 days.",
    },
    {
      t: "Measure, then decide",
      d: "We look at what moved, and whether another month is justified.",
    },
  ],
  selectedBy: [
    "Existing customers or active pipeline",
    "A commercial leak large enough to matter relative to the fee",
    "A sales cycle short enough to observe in 30 days",
    "Access to the data and people required",
    "Someone who can implement a change this month",
  ],
  forWhom: [
    "Founder, owner, CEO, president, CRO, or head of sales",
    "Revenue is already moving through the company",
    "Leads, opportunities, renewals, or customers exist",
    "You can act on a recommendation quickly",
  ],
  notFor: [
    "Idea-stage or hobby projects",
    "Pre-launch products with no buyer activity",
    "People looking for a cheap AI marketing tool",
    "Businesses that cannot or will not share enough to diagnose",
  ],
  priceNote:
    "Selected businesses begin with a $1,500 30-Day Revenue Intervention. Continuation after 30 days depends on what was learned and whether both sides want to continue. Submitting does not obligate you to buy.",
  guaranteeTitle: "The fee comes back if we fail the work",
  guaranteeHook: "Name the leak and the next move, or the $1,500 comes back.",
  guaranteeBody:
    "If we select your business and complete the 30-Day Revenue Intervention without naming the highest-value commercial leak and a next move you can run this month, we refund the $1,500. That is a work guarantee, not a promise that revenue will 2x or 3x. We still decline businesses where 30 days would be theater. Selection happens before you pay.",
  applyTitle: "Start with a work email",
  applyBody:
    "If there is not enough existing commercial motion to justify a 30-day intervention, there is nothing to buy.",
  applyEmailLabel: "Work email",
  applyEmailCta: "Continue",
  applyFormTitle: "A few facts about the business",
  applyConfirm:
    "Enough to tell whether a 30-day intervention would be real work, or theater.",
  received:
    "A person will look at whether there is enough existing commercial motion, measurable upside, and 30-day leverage for the intervention to make sense.",
  applySubmitNote:
    "Submitting does not obligate you to buy. The engagement only proceeds if there is a commercial problem worth attacking.",
  footer:
    "Reliable AI Network, LLC. RAIN Select is a commercial intervention, not a software membership.",
};
