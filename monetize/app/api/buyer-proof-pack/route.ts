import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildBuyerProofPackMarkdown,
  buyerProofPackToMemo,
} from "@/lib/buyer-proof-pack";
import { creationToProductContext } from "@/lib/build-full-brief";
import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
  SalesKit,
} from "@/types";

export const maxDuration = 60;

async function latestAsset<T>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  type: string,
  creationId?: string | null
): Promise<T | null> {
  let q = supabase
    .from("generated_assets")
    .select("content")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1);
  if (creationId) q = q.eq("creation_id", creationId);
  const { data } = await q.maybeSingle();
  return (data?.content as T) ?? null;
}

/** Assemble a forwardable Buyer Proof Pack from latest product assets. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const peek = url.searchParams.get("peek") === "1";
  const creationId = url.searchParams.get("creationId");

  const stress = await latestAsset<BuyerStressTestResult>(
    supabase,
    user.id,
    "buyer_stress_test",
    creationId
  );

  if (peek) {
    return NextResponse.json({ stress });
  }

  let creation = null as Awaited<
    ReturnType<typeof loadCreation>
  >;
  if (creationId) {
    creation = await loadCreation(supabase, user.id, creationId);
  } else {
    const { data } = await supabase
      .from("creations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    creation = data;
  }

  if (!creation) {
    return NextResponse.json(
      { error: "Add a product first" },
      { status: 400 }
    );
  }

  const cid = creation.id as string;
  const [analysis, pricing, sales] = await Promise.all([
    latestAsset<IdeaAnalysis>(supabase, user.id, "idea_analysis", cid),
    latestAsset<PricingRecommendation>(supabase, user.id, "pricing", cid),
    latestAsset<SalesKit>(supabase, user.id, "sales_kit", cid),
  ]);

  const markdown = buildBuyerProofPackMarkdown({
    productTitle: creation.title,
    analysis,
    pricing,
    stress,
    sales,
  });
  const tool_memo = buyerProofPackToMemo({
    productTitle: creation.title,
    analysis,
    pricing,
    stress,
  });
  const product = creationToProductContext(creation);

  return NextResponse.json({
    markdown,
    tool_memo,
    product,
    analysis,
    pricing,
    stress,
  });
}

async function loadCreation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  id: string
) {
  const { data } = await supabase
    .from("creations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
