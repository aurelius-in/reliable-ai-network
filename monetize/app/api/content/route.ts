import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  CONTENT_GENERATOR_SYSTEM_PROMPT,
  buildContentUserPrompt,
} from "@/prompts/content-generator";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import type { ContentBundle } from "@/types";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 300;

/** Ad & Content Generator (Growth): one idea → a full asset bundle. */
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
    tone?: string;
    audience?: string;
    bigPromise?: string;
    positioningLine?: string;
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

  let bundle: ContentBundle;
  try {
    bundle = await grokChatJSON<ContentBundle>([
      { role: "system", content: CONTENT_GENERATOR_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildContentUserPrompt({
          ...resolved.creation,
          tone: body.tone,
          audience: body.audience,
          bigPromise: body.bigPromise,
          positioningLine: body.positioningLine,
        }),
      },
    ]);
  } catch (err) {
    console.error("Content Generator failed:", err);
    return NextResponse.json(
      { error: "Content generation failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "content_bundle",
      content: bundle,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist content bundle:", assetError);
  }

  trackToolRun("content", {}, { userId: user.id, path: "/api/content" });
  return NextResponse.json({ assetId: asset?.id ?? null, bundle });
}
