import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTier } from "@/lib/tool-request";
import { DFY_ASSET_OPTIONS, DFY_ASSET_TYPE } from "@/lib/dfy";
import type { DfyRequestContent } from "@/types";

/**
 * Done-For-You request flow (Pro): submits one custom asset request.
 * Allowance: one request per calendar month.
 */
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
    assetType?: string;
    audience?: string;
    goal?: string;
    tone?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const option = DFY_ASSET_OPTIONS.find((o) => o.id === body.assetType);
  if (!option) {
    return NextResponse.json(
      { error: "Pick a valid asset type" },
      { status: 400 }
    );
  }

  // Enforce the 1-per-calendar-month allowance.
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("generated_assets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("type", DFY_ASSET_TYPE)
    .gte("created_at", monthStart.toISOString());

  if ((count ?? 0) >= 1) {
    return NextResponse.json(
      {
        error:
          "You've used this month's Done-For-You request. Your allowance resets on the 1st.",
      },
      { status: 429 }
    );
  }

  const content: DfyRequestContent = {
    asset_type: option.id,
    audience: body.audience?.trim() || "not specified",
    goal: body.goal?.trim() || "not specified",
    tone: body.tone?.trim() || "not specified",
    notes: body.notes?.trim() || "",
    status: "queued",
    requested_at: new Date().toISOString(),
  };

  const { data: asset, error } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: null,
      type: DFY_ASSET_TYPE,
      content,
    })
    .select("id, created_at")
    .single();

  if (error || !asset) {
    console.error("Failed to save DFY request:", error);
    return NextResponse.json(
      { error: "Could not submit your request. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    request: {
      id: asset.id,
      user_id: user.id,
      creation_id: null,
      type: DFY_ASSET_TYPE,
      content,
      created_at: asset.created_at,
    },
  });
}
