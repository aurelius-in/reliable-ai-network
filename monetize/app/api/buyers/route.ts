import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  BUYER_PROFILES_SYSTEM_PROMPT,
  buildBuyerProfilesUserPrompt,
} from "@/prompts/buyer-profiles";
import { resolveCreation } from "@/lib/tool-request";
import type { BuyerProfilesResult } from "@/types";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 300;

/**
 * Find Your Buyers (Starter): generates 2-3 ideal customer profiles.
 * Like the other Starter tools, usable by any signed-in user.
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

  let result: BuyerProfilesResult;
  try {
    result = await grokChatJSON<BuyerProfilesResult>([
      { role: "system", content: BUYER_PROFILES_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildBuyerProfilesUserPrompt({
          ...resolved.creation,
          goal: body.goal,
        }),
      },
    ]);
  } catch (err) {
    console.error("Find Your Buyers failed:", err);
    return NextResponse.json(
      { error: "Buyer research failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "buyer_profiles",
      content: result,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist buyer profiles:", assetError);
  }

  trackToolRun("buyers", {}, { userId: user.id, path: "/api/buyers" });
  return NextResponse.json({ assetId: asset?.id ?? null, result });
}
