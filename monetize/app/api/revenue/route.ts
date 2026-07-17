import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  REVENUE_STREAMS_SYSTEM_PROMPT,
  buildRevenueStreamsUserPrompt,
} from "@/prompts/revenue-streams";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { RevenueStreamsPlan } from "@/types";

export const maxDuration = 60;

/** Multiple Ways to Get Paid (Pro): revenue-model comparison + build-first pick. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tier = await requireTier(supabase, user.id, "pro");
  if ("error" in tier) {
    return NextResponse.json({ error: tier.error }, { status: tier.status });
  }

  let body: {
    creationId?: string;
    title?: string;
    description?: string;
    type?: string;
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

  let plan: RevenueStreamsPlan;
  try {
    plan = await grokChatJSON<RevenueStreamsPlan>([
      { role: "system", content: REVENUE_STREAMS_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildRevenueStreamsUserPrompt({
          ...resolved.creation,
          goal: body.goal,
        }),
      },
    ]);
  } catch (err) {
    console.error("Revenue Streams failed:", err);
    return NextResponse.json(
      { error: "Revenue plan generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "revenue_streams",
      content: plan,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist revenue streams plan:", assetError);
  }

  return NextResponse.json({ assetId: asset?.id ?? null, plan });
}
