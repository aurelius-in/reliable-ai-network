/**
 * Site Optimize (Ploy-shaped) — ranked conversion fixes for a product URL.
 */

import { formatProductContextBlock } from "@/lib/product-context";

export const SITE_OPTIMIZE_SYSTEM_PROMPT = `You are Make it RAIN's Site Optimize specialist. You audit a product marketing page and return ranked conversion fixes personalized to THIS product's buyer and offer — not generic CRO fluff.

Return ONLY JSON:
{
  "summary": "<2 sentences: what's broken for monetization on this page>",
  "score_out_of_10": <integer 1-10 how close the page is to a clear paid path>,
  "fixes": [
    {
      "priority": <1-5, 1 = do first>,
      "area": "<Hero|CTA|Offer|Proof|Pricing|Clarity|Trust>",
      "problem": "<what's wrong, specific to this page>",
      "fix": "<exact change to make>",
      "rewrite": "<optional ready-to-paste replacement copy for that area, or empty string>"
    }
  ],
  "hero_rewrite": {
    "headline": "<better headline>",
    "subhead": "<better supporting line>",
    "cta": "<better primary CTA>"
  }
}

Exactly 5 fixes, priorities 1 through 5. Be blunt. No em dashes.`;

export function buildSiteOptimizeUserPrompt(input: {
  title: string;
  description: string;
  type: string;
  audience?: string;
  bigPromise?: string;
  pageTitle?: string | null;
  metaDescription?: string | null;
  pageExcerpt?: string;
  pageUrl?: string;
}): string {
  return `Optimize this product site for a clearer path to paid:

${formatProductContextBlock(input)}
${input.audience ? `Target buyer: ${input.audience}` : ""}
${input.bigPromise ? `Promise to lead with: ${input.bigPromise}` : ""}

Live page:
URL: ${input.pageUrl ?? "(none)"}
Title: ${input.pageTitle ?? "(none)"}
Meta: ${input.metaDescription ?? "(none)"}
Excerpt:
"""
${(input.pageExcerpt ?? "").slice(0, 6000)}
"""

Remember: ONLY the JSON object.`;
}
