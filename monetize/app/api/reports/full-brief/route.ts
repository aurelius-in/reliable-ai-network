import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  FOUNDER_BRIEF_EXTRAS_SYSTEM,
  type FounderBriefExtras,
} from "@/lib/founder-brief-extras";
import { assembleFullBriefPayload } from "@/lib/build-full-brief";
import type { ProductContext } from "@/lib/product-context";
import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";

export const maxDuration = 120;

/**
 * Build a Full Report payload (with operator extras) for in-app modal / share.
 * Body: { product, analysis?, pricing?, stress_test?, tool_memo?, cover_note?, enrich?: boolean }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    product?: ProductContext;
    analysis?: IdeaAnalysis | null;
    pricing?: PricingRecommendation | null;
    stress_test?: BuyerStressTestResult | null;
    tool_memo?: import("@/lib/shared-report").ToolMemo | null;
    extras?: FounderBriefExtras | null;
    cover_note?: string | null;
    enrich?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.product?.title || !body.product?.description) {
    return NextResponse.json(
      { error: "product title and description are required" },
      { status: 400 }
    );
  }
  if (
    !body.analysis &&
    !body.pricing &&
    !body.stress_test &&
    !body.tool_memo
  ) {
    return NextResponse.json(
      {
        error:
          "Need Analyzer, Pricing, Stress Test, or tool memo data",
      },
      { status: 400 }
    );
  }

  let extras = body.extras ?? null;
  const shouldEnrich = body.enrich !== false && !extras;

  if (shouldEnrich) {
    try {
      extras = await grokChatJSON<FounderBriefExtras>([
        { role: "system", content: FOUNDER_BRIEF_EXTRAS_SYSTEM },
        {
          role: "user",
          content: `Build the operator addendum for this Full Monetization Brief.

Product: ${body.product.title}
URL: ${body.product.product_url || ""}
Description: ${body.product.description}
Traction: ${body.product.traction || ""}
Price: ${body.product.current_price || ""}

Analyzer commercial answer:
${JSON.stringify(body.analysis?.commercial_answer || {}, null, 2)}

Big promise: ${body.analysis?.big_promise || ""}
Quick wins: ${(body.analysis?.quick_wins || []).join("; ")}

Stress offer rewrite:
${JSON.stringify(body.stress_test?.offer_rewrite || {}, null, 2)}
Verdict: ${body.stress_test?.verdict || "n/a"} - ${body.stress_test?.verdict_line || ""}

Pricing model: ${body.pricing?.recommended_model || "n/a"}

Return ONLY the JSON object.`,
        },
      ]);
    } catch (err) {
      console.error("full-brief enrich failed:", err);
      // Continue without extras rather than failing the whole report
      extras = null;
    }
  }

  const payload = assembleFullBriefPayload({
    product: body.product,
    analysis: body.analysis,
    pricing: body.pricing,
    stress_test: body.stress_test,
    tool_memo: body.tool_memo,
    extras,
    cover_note: body.cover_note,
  });

  return NextResponse.json({ payload, extras });
}
