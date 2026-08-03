import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  TRAFFIC_ENGINE_SYSTEM_PROMPT,
  buildTrafficUserPrompt,
} from "@/prompts/traffic-engine";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { TrafficPlan } from "@/types";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 300;

/** Get Eyes on Your Offer (Growth): channel picks + weekly traffic plan. */
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
    timePerWeek?: string;
    comfort?: string;
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

  let plan: TrafficPlan;
  try {
    plan = await grokChatJSON<TrafficPlan>([
      { role: "system", content: TRAFFIC_ENGINE_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildTrafficUserPrompt({
          ...resolved.creation,
          timePerWeek: body.timePerWeek,
          comfort: body.comfort,
        }),
      },
    ]);
  } catch (err) {
    console.error("Traffic Engine failed:", err);
    return NextResponse.json(
      { error: "Traffic plan generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "traffic_plan",
      content: plan,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist traffic plan:", assetError);
  }

  trackToolRun("traffic", {}, { userId: user.id, path: "/api/traffic" });
  return NextResponse.json({ assetId: asset?.id ?? null, plan });
}
