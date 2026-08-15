/**
 * Ad Poster Writer — copy + visual prompt tailored to a known ad network placement.
 */

import { formatProductContextBlock } from "@/lib/product-context";
import type { AdAspectRatio } from "@/lib/ad-networks";

export const AD_POSTER_SYSTEM_PROMPT = `You are Make it RAIN's Ad Poster Writer. You write ad poster creative personalized to THIS product and THIS network placement — not generic stock-ad fluff.

Return a single JSON object:
{
  "headline": "<short headline on the poster, under 8 words>",
  "subhead": "<one supporting line, under 16 words>",
  "cta": "<button / end-card CTA, 2-4 words>",
  "overlay_text": "<optional small line for footer, or empty string>",
  "primary_text": "<caption / ad primary text for the network, personalized to product + audience>",
  "visual_prompt": "<detailed image-generation prompt: scene, composition, lighting, style. Include readable space for headline. No logos of other brands. No illegible fake UI text. Photoreal or clean flat design as fits the product. Mention aspect framing.>"
}

Rules:
- Personalized to the product name, pain, and offer.
- Fit the network (LinkedIn = professional; TikTok/IG = bold simple; Reddit = less salesy).
- visual_prompt must ask for clean composition with room for text overlay, high contrast, no watermark.
- No em dashes. Return ONLY JSON.`;

export function buildAdPosterUserPrompt(input: {
  title: string;
  description: string;
  type: string;
  networkLabel: string;
  placementLabel: string;
  aspectRatio: AdAspectRatio;
  paid: boolean;
  paidProducts?: string[];
  audience?: string;
  tone?: string;
  bigPromise?: string;
}): string {
  return `Create an ad poster creative for:

${formatProductContextBlock(input)}
Network: ${input.networkLabel}
Placement: ${input.placementLabel}
Aspect ratio: ${input.aspectRatio}
Mode: ${input.paid ? `Paid ads (${(input.paidProducts ?? []).join(", ") || "ads"})` : "Organic post graphic"}
${input.audience ? `Audience: ${input.audience}` : ""}
${input.tone ? `Tone: ${input.tone}` : ""}
${input.bigPromise ? `Lead promise: ${input.bigPromise}` : ""}

Remember: respond with ONLY the JSON object.`;
}
