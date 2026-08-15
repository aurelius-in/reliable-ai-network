/** Fetch a public product URL and extract text evidence for audits. */

export type WebsiteContext = {
  fetched_at: string;
  url: string;
  final_url: string;
  title: string | null;
  meta_description: string | null;
  og_title: string | null;
  text_excerpt: string;
  char_count: number;
};

function isBlockedPublicHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  if (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".localhost")
  ) {
    return true;
  }
  if (h === "0.0.0.0" || h === "::1" || h === "[::1]") return true;
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (isBlockedPublicHost(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function attr(html: string, tag: string, name: string): string | null {
  const re = new RegExp(
    `<${tag}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const m = html.match(re);
  return m?.[1]?.trim() || null;
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${key}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|br|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Fetches a public marketing/product page and extracts title, meta, and body text.
 * No JS rendering — static HTML only (industry-standard first pass for audits).
 */
export async function fetchPublicWebsiteContext(
  productUrl: string
): Promise<WebsiteContext> {
  const url = normalizeUrl(productUrl);
  if (!url) {
    throw new Error(
      "Enter a valid public URL like https://yourproduct.com"
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let res: Response;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "MakeItRAIN-AuditBot/1.0 (+https://makeitrainapp.com)",
      },
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("That URL timed out. Try again or paste key copy into the description.");
    }
    throw new Error("Could not reach that URL. Check it is public and try again.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(`URL returned ${res.status}. It must be publicly reachable.`);
  }

  const landed = res.url || url;
  try {
    const landedHost = new URL(landed).hostname;
    if (isBlockedPublicHost(landedHost)) {
      throw new Error("Enter a valid public URL like https://yourproduct.com");
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("valid public URL")) {
      throw err;
    }
    throw new Error("Enter a valid public URL like https://yourproduct.com");
  }

  const contentType = res.headers.get("content-type") || "";
  if (
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml") &&
    !contentType.includes("text/plain")
  ) {
    throw new Error("That URL did not return an HTML page we can audit.");
  }

  const html = (await res.text()).slice(0, 600_000);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim() || null;
  const meta_description =
    metaContent(html, "description") || metaContent(html, "og:description");
  const og_title = metaContent(html, "og:title");
  let text = htmlToText(html);
  let text_excerpt = text.slice(0, 8000);
  let finalTitle = og_title || title;
  let finalMeta = meta_description;
  let finalUrl = res.url || url;

  // Thin/JS-heavy pages: fall back to Jina Reader text extraction (no browser).
  if (text_excerpt.length < 120) {
    const jina = await fetchViaJinaReader(url);
    if (jina && jina.text_excerpt.length > text_excerpt.length) {
      text = jina.text_excerpt;
      text_excerpt = jina.text_excerpt.slice(0, 8000);
      finalTitle = jina.title || finalTitle;
      finalMeta = jina.meta_description || finalMeta;
      finalUrl = jina.final_url || finalUrl;
    }
  }

  if (text_excerpt.length < 80 && !finalTitle && !finalMeta) {
    throw new Error(
      "Almost no readable text on that page (may be JS-only or blocked). Paste key claims into Traction or Description."
    );
  }

  return {
    fetched_at: new Date().toISOString(),
    url,
    final_url: finalUrl,
    title: finalTitle,
    meta_description: finalMeta,
    og_title,
    text_excerpt,
    char_count: text.length,
  };
}

/** Jina Reader: markdown/text extract for JS-heavy marketing sites. */
async function fetchViaJinaReader(url: string): Promise<{
  title: string | null;
  meta_description: string | null;
  text_excerpt: string;
  final_url: string;
} | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`https://r.jina.ai/${url}`, {
      signal: controller.signal,
      headers: {
        Accept: "text/plain",
        "User-Agent": "MakeItRAIN-AuditBot/1.0 (+https://makeitrainapp.com)",
      },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body = (await res.text()).trim();
    if (body.length < 80) return null;
    const titleMatch = body.match(/^Title:\s*(.+)$/im);
    const urlMatch = body.match(/^URL Source:\s*(.+)$/im);
    const descMatch = body.match(/^Description:\s*(.+)$/im);
    return {
      title: titleMatch?.[1]?.trim() || null,
      meta_description: descMatch?.[1]?.trim() || null,
      text_excerpt: body.slice(0, 8000),
      final_url: urlMatch?.[1]?.trim() || url,
    };
  } catch {
    return null;
  }
}

export function formatWebsiteEvidenceLine(w: WebsiteContext): string {
  const bits = [
    `Product URL: ${w.final_url}`,
    w.title ? `Page title: ${w.title}` : null,
    w.meta_description ? `Meta description: ${w.meta_description}` : null,
    `Page text excerpt (${w.char_count} chars scraped):\n"""\n${w.text_excerpt}\n"""`,
  ].filter(Boolean);
  return bits.join("\n");
}
