import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  BUYER_STRESS_TEST_SYSTEM_PROMPT,
  buildBuyerStressTestUserPrompt,
} from "@/prompts/buyer-stress-test";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import { trackToolRun } from "@/lib/track-server";
import type { BuyerStressTestResult } from "@/types";

export const maxDuration = 300;

/** Buyer Stress Test (Starter+): war-game hostile buyers before outreach. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = await requireTier(supabase, user.id, "starter");
  if ("error" in tier) {
    return NextResponse.json({ error: tier.error }, { status: tier.status });
  }

  let body: {
    creationId?: string;
    title?: string;
    description?: string;
    type?: string;
    audience?: string;
    bigPromise?: string;
    positioningLine?: string;
    priceHint?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const resolved = await resolveCreation(supabase, user.id, body);
  if ("error" in resolved) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.status }
    );
  }

  let result: BuyerStressTestResult;
  try {
    const raw = await grokChatJSON<BuyerStressTestResult>([
      { role: "system", content: BUYER_STRESS_TEST_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildBuyerStressTestUserPrompt({
          ...resolved.creation,
          audience: body.audience,
          bigPromise: body.bigPromise,
          positioningLine: body.positioningLine,
          priceHint: body.priceHint,
        }),
      },
    ]);

    const verdict = String(raw.verdict ?? "fragile").toLowerCase();
    result = {
      verdict: (["survives", "fragile", "dies"].includes(verdict)
        ? verdict
        : "fragile") as BuyerStressTestResult["verdict"],
      verdict_line: String(raw.verdict_line ?? "").trim(),
      survival_score: Math.min(
        10,
        Math.max(1, Number(raw.survival_score) || 5)
      ),
      rounds: Array.isArray(raw.rounds) ? raw.rounds.slice(0, 5) : [],
      fatal_objections: Array.isArray(raw.fatal_objections)
        ? raw.fatal_objections.map(String)
        : [],
      offer_rewrite: {
        smallest_paid_offer: String(
          raw.offer_rewrite?.smallest_paid_offer ?? ""
        ).trim(),
        who_may_pay: String(raw.offer_rewrite?.who_may_pay ?? "").trim(),
        one_line_pitch: String(raw.offer_rewrite?.one_line_pitch ?? "").trim(),
      },
      dm_opener_after_test: String(raw.dm_opener_after_test ?? "").trim(),
      do_not_message_until: Array.isArray(raw.do_not_message_until)
        ? raw.do_not_message_until.map(String)
        : [],
      evidence_gaps: Array.isArray(raw.evidence_gaps)
        ? raw.evidence_gaps
        : [],
    };
  } catch (err) {
    console.error("Buyer Stress Test failed:", err);
    return NextResponse.json(
      { error: "Buyer Stress Test failed. Try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "buyer_stress_test",
      content: result,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist buyer stress test:", assetError);
  }

  trackToolRun(
    "buyer_stress_test",
    { verdict: result.verdict, score: result.survival_score },
    { userId: user.id, path: "/api/buyer-stress-test" }
  );

  return NextResponse.json({ assetId: asset?.id ?? null, result });
}
