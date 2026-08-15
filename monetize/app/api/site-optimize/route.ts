import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import { fetchPublicWebsiteContext } from "@/lib/website-public";
import {
  SITE_OPTIMIZE_SYSTEM_PROMPT,
  buildSiteOptimizeUserPrompt,
} from "@/prompts/site-optimize";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import { trackToolRun } from "@/lib/track-server";
import type { SiteOptimizeResult } from "@/types";

export const maxDuration = 300;

/** Site Optimize (Growth): Ploy-shaped conversion audit + rewrites. */
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
    url?: string;
    audience?: string;
    bigPromise?: string;
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

  const url =
    String(body.url ?? "").trim() ||
    String(resolved.creation.product_url ?? "").trim();
  if (!url) {
    return NextResponse.json(
      { error: "Add a product URL to optimize." },
      { status: 400 }
    );
  }

  let pageTitle: string | null = null;
  let metaDescription: string | null = null;
  let pageExcerpt = "";
  let finalUrl = url;
  try {
    const site = await fetchPublicWebsiteContext(url);
    pageTitle = site.title;
    metaDescription = site.meta_description;
    pageExcerpt = site.text_excerpt;
    finalUrl = site.final_url;
  } catch (err) {
    console.error("Site scrape failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not read that page. Check the URL is public and try again.",
      },
      { status: 422 }
    );
  }

  if (!pageExcerpt) {
    return NextResponse.json(
      {
        error:
          "Could not read that page. Check the URL is public and try again.",
      },
      { status: 422 }
    );
  }

  let result: SiteOptimizeResult;
  try {
    const raw = await grokChatJSON<{
      summary?: string;
      score_out_of_10?: number;
      fixes?: SiteOptimizeResult["fixes"];
      hero_rewrite?: SiteOptimizeResult["hero_rewrite"];
    }>([
      { role: "system", content: SITE_OPTIMIZE_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildSiteOptimizeUserPrompt({
          ...resolved.creation,
          audience: body.audience,
          bigPromise: body.bigPromise,
          pageTitle,
          metaDescription,
          pageExcerpt,
          pageUrl: finalUrl,
        }),
      },
    ]);

    result = {
      url: finalUrl,
      summary: String(raw.summary ?? "").trim(),
      score_out_of_10: Math.min(
        10,
        Math.max(1, Number(raw.score_out_of_10) || 5)
      ),
      fixes: Array.isArray(raw.fixes) ? raw.fixes.slice(0, 5) : [],
      hero_rewrite: {
        headline: String(raw.hero_rewrite?.headline ?? "").trim(),
        subhead: String(raw.hero_rewrite?.subhead ?? "").trim(),
        cta: String(raw.hero_rewrite?.cta ?? "").trim(),
      },
    };
  } catch (err) {
    console.error("Site Optimize failed:", err);
    return NextResponse.json(
      { error: "Site optimize failed. Try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "site_optimize",
      content: result,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist site optimize:", assetError);
  }

  trackToolRun(
    "site_optimize",
    {},
    { userId: user.id, path: "/api/site-optimize" }
  );
  return NextResponse.json({ assetId: asset?.id ?? null, result });
}
