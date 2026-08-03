/**
 * Lightweight founder evidence checklist + next-test suggestions.
 * Client-persisted; used for honesty labels, not fake certainty scores.
 */

export const EVIDENCE_STORAGE_KEY = "rain-evidence-checklist";

export type EvidenceAnswer = "yes" | "no" | "unsure";

export type EvidenceItemId =
  | "buyer_talks"
  | "competitors"
  | "competitor_pricing"
  | "traction"
  | "wtp_test"
  | "feedback";

export const EVIDENCE_ITEMS: {
  id: EvidenceItemId;
  label: string;
}[] = [
  {
    id: "buyer_talks",
    label: "Spoken with potential buyers (or have interview notes)",
  },
  {
    id: "competitors",
    label: "Identified real alternatives or competitors",
  },
  {
    id: "competitor_pricing",
    label: "Reviewed competitor or substitute pricing",
  },
  {
    id: "traction",
    label: "Have traffic, waitlist, signups, or sales numbers",
  },
  {
    id: "wtp_test",
    label: "Tested willingness to pay (presale, paid beta, or quote)",
  },
  {
    id: "feedback",
    label: "Have reviews, support tickets, or user feedback",
  },
];

export type EvidenceAnswers = Partial<Record<EvidenceItemId, EvidenceAnswer>>;

export type EvidenceLevel = "thin" | "some" | "stronger";

export function loadEvidenceAnswers(): EvidenceAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EVIDENCE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as EvidenceAnswers;
  } catch {
    return {};
  }
}

export function saveEvidenceAnswers(answers: EvidenceAnswers): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVIDENCE_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* ignore */
  }
}

export function evidenceLevel(answers: EvidenceAnswers): EvidenceLevel {
  const yes = EVIDENCE_ITEMS.filter((i) => answers[i.id] === "yes").length;
  if (yes >= 4) return "stronger";
  if (yes >= 2) return "some";
  return "thin";
}

export function evidenceLevelLabel(level: EvidenceLevel): string {
  switch (level) {
    case "stronger":
      return "Supported by several inputs you marked";
    case "some":
      return "Partly supported by your evidence checklist";
    default:
      return "Based mainly on your product description";
  }
}

/** Smallest useful next validation step given thin evidence. */
export function suggestNextTest(answers: EvidenceAnswers): string {
  if (answers.buyer_talks !== "yes") {
    return "Ask five target buyers which alternative they use today and what they currently pay.";
  }
  if (answers.competitors !== "yes" || answers.competitor_pricing !== "yes") {
    return "List three real alternatives and note their public price or plan tiers.";
  }
  if (answers.wtp_test !== "yes") {
    return "Run a small willingness-to-pay check: a waitlist with a price, a paid beta, or five direct asks.";
  }
  if (answers.traction !== "yes") {
    return "Capture one week of simple numbers: visitors, signups, and sales (even rough counts help).";
  }
  if (answers.feedback !== "yes") {
    return "Collect five pieces of user language (reviews, DMs, support notes) and compare them to your positioning.";
  }
  return "Pick one assumption in this plan and run the smallest live test this week before scaling spend.";
}
