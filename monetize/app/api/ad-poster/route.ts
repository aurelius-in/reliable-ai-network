import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import { grokGenerateImage } from "@/lib/grok-image";
import {
  getAdNetwork,
  toImagineAspectRatio,
} from "@/lib/ad-networks";
import {
  AD_POSTER_SYSTEM_PROMPT,
  buildAdPosterUserPrompt,
} from "@/prompts/ad-poster";
import { resolveCreation, requireTier } from "@/lib/tool-request";
import { trackToolRun } from "@/lib/track-server";
import type { AdPosterResult } from "@/types";

export const maxDuration = 300;

/** Ad Poster Writer (Growth): network-tailored poster copy + generated image. */
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
    networkId?: string;
    placementId?: string;
    audience?: string;
    tone?: string;
    bigPromise?: string;
    generateImage?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const network = getAdNetwork(body.networkId ?? "");
  if (!network) {
    return NextResponse.json(
      { error: "Pick a social or ad network." },
      { status: 400 }
    );
  }

  const placement =
    network.placements.find((p) => p.id === body.placementId) ??
    network.placements[0];
  if (!placement) {
    return NextResponse.json(
      { error: "No placement for that network." },
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

  let creative: {
    headline?: string;
    subhead?: string;
    cta?: string;
    overlay_text?: string;
    primary_text?: string;
    visual_prompt?: string;
  };
  try {
    creative = await grokChatJSON([
      { role: "system", content: AD_POSTER_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildAdPosterUserPrompt({
          ...resolved.creation,
          networkLabel: network.label,
          placementLabel: placement.label,
          aspectRatio: placement.aspectRatio,
          paid: network.paid,
          paidProducts: network.paidProducts,
          audience: body.audience,
          tone: body.tone,
          bigPromise: body.bigPromise,
        }),
      },
    ]);
  } catch (err) {
    console.error("Ad Poster copy failed:", err);
    return NextResponse.json(
      { error: "Ad poster copy failed. Try again in a moment." },
      { status: 502 }
    );
  }

  const headline = String(creative.headline ?? "").trim();
  const visualPrompt = String(creative.visual_prompt ?? "").trim();
  if (!headline || !visualPrompt) {
    return NextResponse.json(
      { error: "Ad poster response was incomplete." },
      { status: 502 }
    );
  }

  let imageUrl: string | null = null;
  let imageError: string | null = null;
  const wantImage = body.generateImage !== false;
  if (wantImage) {
    try {
      const imagePrompt = [
        visualPrompt,
        `Include clear readable poster text: "${headline}".`,
        creative.subhead ? `Subhead: "${creative.subhead}".` : "",
        creative.cta ? `CTA badge: "${creative.cta}".` : "",
        "Clean ad poster layout, high contrast, no watermarks, no other brand logos.",
      ]
        .filter(Boolean)
        .join(" ");
      const img = await grokGenerateImage({
        prompt: imagePrompt,
        aspectRatio: toImagineAspectRatio(placement.aspectRatio),
      });
      imageUrl = img.url;
    } catch (err) {
      console.error("Ad Poster image failed:", err);
      imageError =
        err instanceof Error
          ? err.message.slice(0, 200)
          : "Image generation unavailable";
    }
  }

  const poster: AdPosterResult = {
    network_id: network.id,
    network_label: network.label,
    placement_id: placement.id,
    placement_label: placement.label,
    aspect_ratio: placement.aspectRatio,
    paid: network.paid,
    paid_products: network.paidProducts,
    headline,
    subhead: String(creative.subhead ?? "").trim(),
    cta: String(creative.cta ?? "").trim(),
    overlay_text: String(creative.overlay_text ?? "").trim(),
    primary_text: String(creative.primary_text ?? "").trim(),
    visual_prompt: visualPrompt,
    image_url: imageUrl,
    image_error: imageError,
  };

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: resolved.creation.id,
      type: "ad_poster",
      content: poster,
    })
    .select("id")
    .single();

  if (assetError) {
    console.error("Failed to persist ad poster:", assetError);
  }

  trackToolRun("ad_poster", {}, { userId: user.id, path: "/api/ad-poster" });
  return NextResponse.json({ assetId: asset?.id ?? null, poster });
}
