import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  PRICING_SYSTEM_PROMPT,
  buildPricingUserPrompt,
} from "@/prompts/pricing-recommendations";
import type { PricingRecommendation } from "@/types";

export const maxDuration = 60;

/** Runs the Pricing & Packaging Builder on an existing creation. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { creationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.creationId) {
    return NextResponse.json({ error: "creationId is required" }, { status: 400 });
  }

  const { data: creation, error } = await supabase
    .from("creations")
    .select("id, title, description, type")
    .eq("id", body.creationId)
    .eq("user_id", user.id)
    .single();

  if (error || !creation) {
    return NextResponse.json({ error: "Creation not found" }, { status: 404 });
  }

  let pricing: PricingRecommendation;
  try {
    pricing = await grokChatJSON<PricingRecommendation>([
      { role: "system", content: PRICING_SYSTEM_PROMPT },
      { role: "user", content: buildPricingUserPrompt(creation) },
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
      creation_id: creation.id,
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
