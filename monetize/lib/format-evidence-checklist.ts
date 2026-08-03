import {
  EVIDENCE_ITEMS,
  evidenceLevel,
  type EvidenceAnswers,
} from "@/lib/evidence-quality";

/** Serialize checklist answers for LLM prompts. */
export function formatEvidenceChecklistBlock(
  answers?: EvidenceAnswers | null
): string {
  if (!answers || Object.keys(answers).length === 0) {
    return "Founder evidence checklist: not provided (treat commercial claims as lightly evidenced).";
  }
  const level = evidenceLevel(answers);
  const lines = EVIDENCE_ITEMS.map((item) => {
    const v = answers[item.id] ?? "unsure";
    return `- ${item.label}: ${v}`;
  });
  return [
    `Founder evidence checklist (self-reported, level=${level}):`,
    ...lines,
    "Weight confidence and citations using this checklist. Do not invent buyer talks or metrics the founder marked no/unsure.",
  ].join("\n");
}
