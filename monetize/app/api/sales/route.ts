import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  SALES_KIT_SYSTEM_PROMPT,
  buildSalesKitUserPrompt,
} from "@/prompts/sales-kit";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { SalesKit } from "@/types";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 300;

/** Direct Sales Tools (Pro): outreach openers, follow-ups, objections, call agenda. */
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
    channel?: string;
    tone?: string;
    targetBuyer?: string;
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

  let kit: SalesKit;
  try {
    kit = await grokChatJSON<SalesKit>([
      { role: "system", content: SALES_KIT_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildSalesKitUserPrompt({
          ...resolved.creation,
          channel: body.channel,
          tone: body.tone,
          targetBuyer: body.targetBuyer,
        }),
      },
    ]);
  } catch (err) {
    console.error("Direct Sales Tools failed:", err);
    return NextResponse.json(
      { error: "Sales kit generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "sales_kit",
      content: kit,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist sales kit:", assetError);
  }

  trackToolRun("sales", {}, { userId: user.id, path: "/api/sales" });
  return NextResponse.json({ assetId: asset?.id ?? null, kit });
}
