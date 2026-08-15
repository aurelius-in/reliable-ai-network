import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";
import type { ProductContext } from "@/lib/product-context";
import type { FounderBriefExtras } from "@/lib/founder-brief-extras";
import {
  buildSharedReportPayload,
  type SharedReportPayload,
  type ToolMemo,
} from "@/lib/shared-report";
import { buildProductBlurb, cleanWebsiteExcerpt } from "@/lib/clean-website-excerpt";
import { scoreScaleNote, toFounderFacingScore } from "@/lib/founder-facing-score";

/** Build a Full Report payload without calling Grok (extras optional). */
export function assembleFullBriefPayload(input: {
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress_test?: BuyerStressTestResult | null;
  tool_memo?: ToolMemo | null;
  extras?: FounderBriefExtras | null;
  cover_note?: string | null;
}): SharedReportPayload {
  const product = sanitizeProductForBrief(input.product);
  const product_blurb = buildProductBlurb({
    meta: product.website_context?.meta_description,
    title: product.website_context?.title,
    excerpt: product.website_context?.text_excerpt,
    fallback: product.description,
  });

  let analysis = input.analysis ?? null;
  if (analysis) {
    const facing = toFounderFacingScore(analysis.score);
    const reasoning = analysis.score_reasoning || "";
    analysis = {
      ...analysis,
      score_reasoning: reasoning.includes("5-10")
        ? reasoning
        : [
            scoreScaleNote(),
            `Band on this brief: ${facing.label} (${facing.display}/10 readiness).`,
            reasoning,
          ]
            .filter(Boolean)
            .join(" "),
    };
  }

  return buildSharedReportPayload({
    product: {
      ...product,
      description: product_blurb,
    },
    analysis,
    pricing: input.pricing ?? null,
    stress_test: input.stress_test ?? null,
    tool_memo: input.tool_memo ?? null,
    extras: input.extras ?? null,
    product_blurb,
    cover_note:
      input.cover_note ??
      `Full Monetization Brief for ${product.title}. Executive path plus comprehensive analysis.`,
    status: "ready",
  });
}

export function sanitizeProductForBrief(product: ProductContext): ProductContext {
  const w = product.website_context;
  if (!w) return product;
  const cleaned = cleanWebsiteExcerpt(w.text_excerpt || "", 1200);
  return {
    ...product,
    website_context: {
      ...w,
      text_excerpt: cleaned,
      char_count: cleaned.length,
    },
  };
}

export function creationToProductContext(creation: {
  title: string;
  description: string;
  type: string;
  stage?: string | null;
  traction?: string | null;
  current_price?: string | null;
  competitors_notes?: string | null;
  evidence_docs?: ProductContext["evidence_docs"];
  github_repo_url?: string | null;
  github_context?: ProductContext["github_context"];
  product_url?: string | null;
  website_context?: ProductContext["website_context"];
  id?: string;
}): ProductContext {
  return {
    id: creation.id,
    title: creation.title,
    description: creation.description,
    type: creation.type,
    stage: creation.stage,
    traction: creation.traction,
    current_price: creation.current_price,
    competitors_notes: creation.competitors_notes,
    evidence_docs: creation.evidence_docs,
    github_repo_url: creation.github_repo_url,
    github_context: creation.github_context,
    product_url: creation.product_url,
    website_context: creation.website_context,
  };
}
