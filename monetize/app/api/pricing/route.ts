import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  PRICING_SYSTEM_PROMPT,
  buildPricingUserPrompt,
} from "@/prompts/pricing-recommendations";
import { resolveCreation } from "@/lib/tool-request";
import type { PricingRecommendation } from "@/types";

export const maxDuration = 300;

/**
 * Pricing & Packaging Builder (Starter).
 * Body: { creationId } for a saved creation, or inline
 * { title, description, type } for one-tap examples.
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
    creationId?: string;
    title?: string;
    description?: string;
    type?: string;
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

  let pricing: PricingRecommendation;
  try {
    pricing = await grokChatJSON<PricingRecommendation>([
      { role: "system", content: PRICING_SYSTEM_PROMPT },
      { role: "user", content: buildPricingUserPrompt(resolved.creation) },
    ]);
  } catch (err) {
    console.error("Pricing builder failed:", err);
    return NextResponse.json(
      { error: "Pricing generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "pricing",
      content: pricing,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist pricing asset:", assetError);
  }

  return NextResponse.json({ assetId: asset?.id ?? null, pricing });
}
