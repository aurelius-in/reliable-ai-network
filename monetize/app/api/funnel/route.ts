import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  FUNNEL_ARCHITECT_SYSTEM_PROMPT,
  buildFunnelUserPrompt,
} from "@/prompts/funnel-architect";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { FunnelPlan } from "@/types";

export const maxDuration = 300;

/** Funnel Architect (Growth): builds a 3-stage funnel with copy. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = await requireTier(supabase, user.id, "growth");
  if ("error" in tier) {
    return NextResponse.json({ error: tier.error }, { status: tier.status });
  }

  let body: {
    creationId?: string;
    title?: string;
    description?: string;
    type?: string;
    priceBand?: string;
    audience?: string;
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

  let funnel: FunnelPlan;
  try {
    funnel = await grokChatJSON<FunnelPlan>([
      { role: "system", content: FUNNEL_ARCHITECT_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildFunnelUserPrompt({
          ...resolved.creation,
          priceBand: body.priceBand,
          audience: body.audience,
        }),
      },
    ]);
  } catch (err) {
    console.error("Funnel Architect failed:", err);
    return NextResponse.json(
      { error: "Funnel generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "funnel",
      content: funnel,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist funnel asset:", assetError);
  }

  return NextResponse.json({ assetId: asset?.id ?? null, funnel });
}
