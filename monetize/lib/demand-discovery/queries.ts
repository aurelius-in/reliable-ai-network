/**
 * Build intent search queries from product context.
 * Prefer pain / "looking for" language over category keywords.
 */

import type { ProductContext } from "@/lib/product-context";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "your",
  "you",
  "that",
  "this",
  "from",
  "into",
  "using",
  "based",
  "platform",
  "software",
  "app",
  "tool",
  "saas",
  "ai",
  "help",
  "helps",
]);

function keywordsFromText(text: string, max = 6): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
  const uniq: string[] = [];
  for (const w of words) {
    if (!uniq.includes(w)) uniq.push(w);
    if (uniq.length >= max) break;
  }
  return uniq;
}

/** Public queries for Reddit / web search. */
export function buildDemandQueries(product: ProductContext): string[] {
  const titleBits = keywordsFromText(product.title, 4);
  const descBits = keywordsFromText(product.description, 8);
  const core = [...titleBits, ...descBits].slice(0, 5);
  const primary = core.slice(0, 3).join(" ");
  const secondary = core.slice(1, 4).join(" ");

  // Keep queries short. HN Algolia returns empty on heavy boolean soup.
  const queries = [
    primary ? `${primary} customers` : "first paying customers SaaS",
    primary ? `looking for ${primary}` : "looking for SaaS tool",
    "first paying customer",
    "no customers SaaS",
    secondary ? `${secondary} pricing` : "how to price SaaS",
    product.competitors_notes?.trim()
      ? `alternative to ${keywordsFromText(product.competitors_notes, 2).join(" ")}`
      : "built SaaS no users",
  ].filter(Boolean) as string[];

  return [...new Set(queries)].slice(0, 6);
}
