import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  LAUNCH_PLAN_SYSTEM_PROMPT,
  buildLaunchPlanUserPrompt,
} from "@/prompts/launch-plan";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { LaunchPlan } from "@/types";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 300;

/** 30-Day Launch Plan (Growth): day-by-day launch sequence with scripts. */
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
    audience?: string;
    goal?: string;
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

  let plan: LaunchPlan;
  try {
    plan = await grokChatJSON<LaunchPlan>([
      { role: "system", content: LAUNCH_PLAN_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildLaunchPlanUserPrompt({
          ...resolved.creation,
          audience: body.audience,
          goal: body.goal,
        }),
      },
    ]);
  } catch (err) {
    console.error("Launch Plan failed:", err);
    return NextResponse.json(
      { error: "Launch plan generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "launch_plan",
      content: plan,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist launch plan:", assetError);
  }

  trackToolRun("launch", {}, { userId: user.id, path: "/api/launch" });
  return NextResponse.json({ assetId: asset?.id ?? null, plan });
}
