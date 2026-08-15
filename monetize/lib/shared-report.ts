import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";
import type { ProductContext } from "@/lib/product-context";
import { listEvidenceSources } from "@/lib/product-context";
import type { FounderBriefExtras } from "@/lib/founder-brief-extras";

export type SharedReportStatus = "generating" | "ready" | "failed";

/** Generic tool memo for Strategy / Site Optimize / Proof Pack Full Briefs. */
export type ToolMemo = {
  tool_label: string;
  headline: string;
  bullets: string[];
  next_action?: string;
};

export type SharedReportPayload = {
  version: 1 | 2 | 3;
  generated_at: string;
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress_test?: BuyerStressTestResult | null;
  tool_memo?: ToolMemo | null;
  cover_note?: string | null;
  extras?: FounderBriefExtras | null;
  product_blurb?: string | null;
  evidence_sources: string[];
  /** Async founder-brief generation lifecycle. */
  status?: SharedReportStatus;
  error?: string | null;
};

export function buildSharedReportPayload(input: {
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress_test?: BuyerStressTestResult | null;
  tool_memo?: ToolMemo | null;
  cover_note?: string | null;
  extras?: FounderBriefExtras | null;
  product_blurb?: string | null;
  status?: SharedReportStatus;
  error?: string | null;
}): SharedReportPayload {
  const hasV3 = Boolean(
    input.extras || input.product_blurb || input.status || input.tool_memo
  );
  return {
    version: hasV3 ? 3 : input.stress_test || input.cover_note ? 2 : 1,
    generated_at: new Date().toISOString(),
    product: input.product,
    analysis: input.analysis ?? null,
    pricing: input.pricing ?? null,
    stress_test: input.stress_test ?? null,
    tool_memo: input.tool_memo ?? null,
    cover_note: input.cover_note ?? null,
    extras: input.extras ?? null,
    product_blurb: input.product_blurb ?? null,
    evidence_sources: listEvidenceSources(input.product),
    status: input.status ?? "ready",
    error: input.error ?? null,
  };
}

export function newShareToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
