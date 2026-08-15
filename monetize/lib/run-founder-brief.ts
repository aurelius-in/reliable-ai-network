import { grokChatJSON } from "@/lib/grok";
import {
  IDEA_ANALYZER_SYSTEM_PROMPT,
  buildIdeaAnalyzerUserPrompt,
} from "@/prompts/idea-analyzer";
import {
  BUYER_STRESS_TEST_SYSTEM_PROMPT,
  buildBuyerStressTestUserPrompt,
} from "@/prompts/buyer-stress-test";
import { buildSharedReportPayload } from "@/lib/shared-report";
import type { ProductContext } from "@/lib/product-context";
import type { BuyerStressTestResult, IdeaAnalysis } from "@/types";
import {
  FOUNDER_BRIEF_EXTRAS_SYSTEM,
  type FounderBriefExtras,
} from "@/lib/founder-brief-extras";
import {
  scoreScaleNote,
  toFounderFacingScore,
} from "@/lib/founder-facing-score";
import type { SharedReportPayload } from "@/lib/shared-report";

export type FounderBriefInput = {
  product: ProductContext;
  product_blurb: string;
  cover_note: string;
  audience?: string;
  current_price: string;
};

/** Runs Analyzer + Stress Test (+ extras) and returns a ready payload. */
export async function runFounderBriefGeneration(
  input: FounderBriefInput
): Promise<SharedReportPayload> {
  const { product, product_blurb, cover_note, audience, current_price } = input;

  const [analysisRaw, stressRaw] = await Promise.all([
    grokChatJSON<IdeaAnalysis>([
      { role: "system", content: IDEA_ANALYZER_SYSTEM_PROMPT },
      { role: "user", content: buildIdeaAnalyzerUserPrompt(product) },
    ]),
    grokChatJSON<BuyerStressTestResult>([
      { role: "system", content: BUYER_STRESS_TEST_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildBuyerStressTestUserPrompt({
          title: product.title,
          description: product.description,
          type: product.type,
          audience:
            audience?.trim() ||
            "Primary buyer who might pay for the smallest paid offer on this product",
          priceHint: current_price,
        }),
      },
    ]),
  ]);

  const facing = toFounderFacingScore(analysisRaw.score);
  const analysis: IdeaAnalysis = {
    ...analysisRaw,
    score_reasoning: [
      scoreScaleNote(),
      `Band on this brief: ${facing.label} (${facing.display}/10 readiness).`,
      analysisRaw.score_reasoning,
      Number(analysisRaw.score) < 5
        ? "Note: early monetization evidence is thin. The readiness score on this brief floors at 5/10 so the number reflects stage, not a judgment on product quality or founder effort."
        : "",
    ]
      .filter(Boolean)
      .join(" "),
  };

  const verdict = String(stressRaw.verdict ?? "fragile").toLowerCase();
  const stress_test: BuyerStressTestResult = {
    verdict: (["survives", "fragile", "dies"].includes(verdict)
      ? verdict
      : "fragile") as BuyerStressTestResult["verdict"],
    verdict_line: String(stressRaw.verdict_line ?? "").trim(),
    survival_score: Math.min(
      10,
      Math.max(1, Number(stressRaw.survival_score) || 5)
    ),
    rounds: Array.isArray(stressRaw.rounds) ? stressRaw.rounds.slice(0, 5) : [],
    fatal_objections: Array.isArray(stressRaw.fatal_objections)
      ? stressRaw.fatal_objections.map(String)
      : [],
    offer_rewrite: {
      smallest_paid_offer: String(
        stressRaw.offer_rewrite?.smallest_paid_offer ?? ""
      ).trim(),
      who_may_pay: String(stressRaw.offer_rewrite?.who_may_pay ?? "").trim(),
      one_line_pitch: String(
        stressRaw.offer_rewrite?.one_line_pitch ?? ""
      ).trim(),
    },
    dm_opener_after_test: String(stressRaw.dm_opener_after_test ?? "").trim(),
    do_not_message_until: Array.isArray(stressRaw.do_not_message_until)
      ? stressRaw.do_not_message_until.map(String)
      : [],
    evidence_gaps: Array.isArray(stressRaw.evidence_gaps)
      ? stressRaw.evidence_gaps
      : [],
  };

  let extras: FounderBriefExtras | null = null;
  try {
    extras = await grokChatJSON<FounderBriefExtras>([
      { role: "system", content: FOUNDER_BRIEF_EXTRAS_SYSTEM },
      {
        role: "user",
        content: `Build the operator addendum for this Founder Brief.

Product: ${product.title}
URL: ${product.product_url || ""}
Blurb: ${product_blurb}
Traction: ${product.traction || ""}
Price: ${current_price}

Analyzer commercial answer:
${JSON.stringify(analysis.commercial_answer || {}, null, 2)}

Big promise: ${analysis.big_promise || ""}
Quick wins: ${(analysis.quick_wins || []).join("; ")}

Stress offer rewrite:
${JSON.stringify(stress_test.offer_rewrite, null, 2)}
Verdict: ${stress_test.verdict} - ${stress_test.verdict_line}

Return ONLY the JSON object.`,
      },
    ]);
  } catch (err) {
    console.error("founder-brief extras failed (continuing):", err);
  }

  return buildSharedReportPayload({
    product,
    analysis,
    stress_test,
    cover_note,
    extras,
    product_blurb,
    status: "ready",
  });
}
