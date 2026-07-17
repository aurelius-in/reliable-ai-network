import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  STRATEGY_SYSTEM_PROMPTS,
  buildStrategyUserPrompt,
} from "@/prompts/strategy-tools";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { StrategyToolId } from "@/types";

export const maxDuration = 60;

const VALID_TOOLS: StrategyToolId[] = [
  "competitors",
  "pricing_optimization",
  "roadmap",
  "ab_tests",
];

/** Advanced Strategy Tools (Pro): runs one of four strategy analyses. */
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
    tool?: StrategyToolId;
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

  const tool = body.tool;
  if (!tool || !VALID_TOOLS.includes(tool)) {
    return NextResponse.json(
      { error: `tool must be one of: ${VALID_TOOLS.join(", ")}` },
      { status: 400 }
    );
  }

  const resolved = await resolveCreation(supabase, user.id, body);
  if ("error" in resolved) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.status }
    );
  }

  let result: unknown;
  try {
    result = await grokChatJSON<unknown>([
      { role: "system", content: STRATEGY_SYSTEM_PROMPTS[tool] },
      { role: "user", content: buildStrategyUserPrompt(tool, resolved.creation) },
    ]);
  } catch (err) {
    console.error(`Strategy tool "${tool}" failed:`, err);
    return NextResponse.json(
      { error: "Strategy generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: `strategy_${tool}`,
      content: result,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist strategy asset:", assetError);
  }

  return NextResponse.json({ assetId: asset?.id ?? null, tool, result });
}
