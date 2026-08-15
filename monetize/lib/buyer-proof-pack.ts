import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
  SalesKit,
} from "@/types";
import type { ToolMemo } from "@/lib/shared-report";

export function buildBuyerProofPackMarkdown(input: {
  productTitle: string;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress?: BuyerStressTestResult | null;
  sales?: SalesKit | null;
}): string {
  const ca = input.analysis?.commercial_answer;
  const lines = [
    `# Buyer Proof Pack — ${input.productTitle}`,
    "",
    "_Forwardable justification for a serious buyer. No invented testimonials._",
    "",
    "## Problem",
    ca?.valuable_pain ||
      input.analysis?.big_promise ||
      "The buyer’s costly problem (fill from your last conversation).",
    "",
    "## Offer",
    ca?.smallest_paid_offer ||
      input.stress?.offer_rewrite?.smallest_paid_offer ||
      "Smallest paid offer to test.",
    "",
    "## Who this is for",
    ca?.primary_buyer ||
      input.stress?.offer_rewrite?.who_may_pay ||
      "Named buyer segment.",
    "",
    "## Price rationale",
    input.pricing?.willingness_to_pay_logic ||
      input.pricing?.model_reasoning ||
      "Why this price is fair relative to the cost of the problem.",
    input.pricing?.price_ranges?.[0]
      ? `Suggested: $${input.pricing.price_ranges[0].sweet_spot} (${input.pricing.recommended_model})`
      : "",
    "",
    "## Proof (observed only)",
    ...((input.analysis?.citations || [])
      .filter((e) => e.grade === "observed")
      .slice(0, 5)
      .map((e) => `- ${e.claim}`) || []),
    ...(!(input.analysis?.citations || []).some((e) => e.grade === "observed")
      ? ["- Add observed evidence from your product or pilots."]
      : []),
    "",
    "## Risks / honesty",
    ca?.honesty_note ||
      input.stress?.fatal_objections?.[0] ||
      "What is still unproven.",
    "",
    "## Pitch",
    input.stress?.offer_rewrite?.one_line_pitch ||
      input.analysis?.big_promise ||
      "",
    "",
    "## Suggested opener",
    input.stress?.dm_opener_after_test ||
      input.sales?.opener_messages?.[0]?.message ||
      "",
    "",
    "## Next step",
    "Ask for a clear decision: pay / pilot / no — and a date.",
    "",
  ];
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

export function buyerProofPackToMemo(input: {
  productTitle: string;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress?: BuyerStressTestResult | null;
}): ToolMemo {
  const ca = input.analysis?.commercial_answer;
  return {
    tool_label: "Buyer Proof Pack",
    headline:
      ca?.smallest_paid_offer ||
      input.stress?.offer_rewrite?.smallest_paid_offer ||
      `Proof pack for ${input.productTitle}`,
    bullets: [
      ca?.primary_buyer || input.stress?.offer_rewrite?.who_may_pay || "",
      ca?.valuable_pain || "",
      input.pricing?.willingness_to_pay_logic?.slice(0, 160) ||
        input.pricing?.model_reasoning?.slice(0, 160) ||
        "",
      input.stress?.fatal_objections?.[0]
        ? `Risk: ${input.stress.fatal_objections[0]}`
        : ca?.honesty_note || "",
    ].filter(Boolean),
    next_action:
      "Send this pack after a serious conversation and ask for a clear yes/no.",
  };
}
