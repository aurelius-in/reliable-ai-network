/** Ungated homepage teaser: one commercial result before an account. */

export type PublicTeaserResult = {
  product_name: string;
  likely_buyer: string;
  unproven_assumption: string;
  price_hypothesis: string;
  next_conversation: string;
};

export const PUBLIC_TEASER_SYSTEM = `You write a 4-line commercial teaser for a founder who already shipped a product.
Ground every line in the page scrape. If evidence is thin, say so. Do not invent customers, revenue, or testimonials.
Short sentences. No hype. No em dashes or en dashes.
This is a hypothesis they can argue with, not a score and not a guaranteed sale.
Return ONLY JSON:
{
  "product_name": "<name from the page, or hostname>",
  "likely_buyer": "<one defensible first buyer, specific role or situation>",
  "unproven_assumption": "<the most uncomfortable thing still unproven about who pays or why>",
  "price_hypothesis": "<one testable number or range, with what they get>",
  "next_conversation": "<one concrete person or type to talk to this week, and why them>"
}
Each value: 1-2 sentences, under 280 characters.`;

export function clipTeaser(raw: PublicTeaserResult): PublicTeaserResult {
  const clip = (s: unknown, max = 280) =>
    String(s ?? "")
      .replace(/\u2014/g, " - ")
      .replace(/\u2013/g, "-")
      .trim()
      .slice(0, max);
  return {
    product_name: clip(raw.product_name, 80) || "This product",
    likely_buyer: clip(raw.likely_buyer),
    unproven_assumption: clip(raw.unproven_assumption),
    price_hypothesis: clip(raw.price_hypothesis),
    next_conversation: clip(raw.next_conversation),
  };
}
