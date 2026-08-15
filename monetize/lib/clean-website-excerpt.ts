/** Clean marketing-page scrape text for briefs (drop nav chrome, collapse noise). */

const NAV_LINE =
  /^(skip to main content|features|demo|how it works|faq|support|download|app store|google play|explore features|see it in action|sign in|log in|menu|home|pricing|blog|about|contact|privacy|terms)$/i;

const EMOJI_HEAVY = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+$/u;

export function cleanWebsiteExcerpt(raw: string, maxChars = 900): string {
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const kept: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const key = line.toLowerCase();
    if (NAV_LINE.test(line)) continue;
    if (EMOJI_HEAVY.test(line)) continue;
    if (line.length < 12 && !/[.!?]$/.test(line)) continue;
    if (seen.has(key)) continue;
    // Drop pure link lists / repeated CTAs
    if (/^(app store|google play)$/i.test(line)) continue;
    seen.add(key);
    kept.push(line);
    if (kept.join(" ").length >= maxChars * 1.4) break;
  }

  let out = kept.join(" ").replace(/\s+/g, " ").trim();
  if (out.length > maxChars) {
    out = out.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
  }
  return out;
}

/** Short product blurb for the brief body (not a scrape dump). */
export function buildProductBlurb(input: {
  meta?: string | null;
  title?: string | null;
  excerpt?: string | null;
  fallback: string;
}): string {
  const meta = (input.meta || "").trim();
  if (meta.length >= 40) return meta.slice(0, 420);
  const cleaned = cleanWebsiteExcerpt(input.excerpt || "", 420);
  if (cleaned.length >= 40) return cleaned;
  return input.fallback.slice(0, 420);
}
