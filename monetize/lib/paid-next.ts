import { GUARANTEE } from "@/lib/guarantee";
import { RAIN_SELECT } from "@/rain-select/config";

const selectPrice = RAIN_SELECT.monthlyPrice.toLocaleString("en-US");

/** After the free brief: trial (card) or RAIN Select. */
export const PAID_NEXT = {
  kicker: "After the brief",
  headline: "Continue with a trial, or request a 30-day intervention.",
  support:
    "The First Customer Path is complete. A trial places a card on file and puts the 60-day conversation guarantee in force. Companies with customers or pipeline may be better served by operators than by another software seat.",

  mirEyebrow: "Make it RAIN",
  mirTitle: "30-day trial",
  mirBody:
    "Choose Starter, Growth, or Pro. A card is stored at checkout. Cancel before day 30 and nothing is billed. If you continue, run the path in good faith. Clearer ranked conversations in 60 days, or subscription fees from that window returned.",
  mirProof: GUARANTEE.hook,
  mirCta: "Begin 30-day trial",
  mirCheckout: "/checkout?tier=starter",
  mirPlans: "/pricing",
  mirGuarantee: GUARANTEE.termsPath,

  selectEyebrow: "RAIN Select",
  selectTitle: "30-Day Revenue Intervention",
  selectBody: `For businesses with existing customers, pipeline, or a commercial leak large enough to matter. $${selectPrice} for 30 days of operator attention. We review fit before we take the engagement. If we accept the work and do not name the highest-value constraint and a next move you can run this month, the $${selectPrice} is returned.`,
  selectProof: `Name the constraint and the next move, or the $${selectPrice} is returned.`,
  selectCta: "Request a selection review",
  selectHref: `${RAIN_SELECT.domain.replace(/\/$/, "")}/?utm_source=makeitrain&utm_medium=in_app&utm_campaign=post_brief#apply`,
  selectPrice: RAIN_SELECT.monthlyPrice,
} as const;
