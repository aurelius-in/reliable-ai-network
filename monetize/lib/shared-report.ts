import type { IdeaAnalysis, PricingRecommendation } from "@/types";
import type { ProductContext } from "@/lib/product-context";
import { listEvidenceSources } from "@/lib/product-context";

export type SharedReportPayload = {
  version: 1;
  generated_at: string;
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  evidence_sources: string[];
};

export function buildSharedReportPayload(input: {
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
}): SharedReportPayload {
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    product: input.product,
    analysis: input.analysis ?? null,
    pricing: input.pricing ?? null,
    evidence_sources: listEvidenceSources(input.product),
  };
}

export function newShareToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
