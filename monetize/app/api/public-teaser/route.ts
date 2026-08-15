import { NextResponse } from "next/server";
import { grokChatJSON } from "@/lib/grok";
import { fetchPublicWebsiteContext } from "@/lib/website-public";
import { getClientIp, hashIp } from "@/lib/client-ip";
import { normalizeProductUrl } from "@/lib/pending-product-url";
import {
  PUBLIC_TEASER_SYSTEM,
  clipTeaser,
  type PublicTeaserResult,
} from "@/lib/public-teaser";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_LIMIT = 6;
const COOKIE = "rain_teaser_n";

const ipBuckets = new Map<string, { day: string; n: number }>();
const urlCache = new Map<string, { at: number; result: PublicTeaserResult }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCookieCount(request: Request): { day: string; n: number } {
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE}=`));
  if (!raw) return { day: todayUtc(), n: 0 };
  try {
    const val = decodeURIComponent(raw.slice(COOKIE.length + 1));
    const [day, nStr] = val.split("|");
    const n = Number(nStr);
    if (day === todayUtc() && Number.isFinite(n)) return { day, n };
  } catch {
    /* ignore */
  }
  return { day: todayUtc(), n: 0 };
}

function cacheKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url =
    typeof body.url === "string" ? normalizeProductUrl(body.url) : "";
  if (!url) {
    return NextResponse.json(
      { error: "Paste a public product URL like https://yourproduct.com" },
      { status: 400 }
    );
  }

  const day = todayUtc();
  const ipKey = hashIp(getClientIp(request));
  const ipState = ipBuckets.get(ipKey);
  const ipCount = ipState?.day === day ? ipState.n : 0;
  const cookieState = readCookieCount(request);
  const used = Math.max(ipCount, cookieState.n);

  if (used >= DAILY_LIMIT) {
    return NextResponse.json(
      {
        error:
          "That's the free look for today. Save the product to run the full First Customer Path.",
        limit: true,
      },
      { status: 429 }
    );
  }

  const key = cacheKey(url);
  const cached = urlCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json({ url, result: cached.result, cached: true });
  }

  try {
    const site = await fetchPublicWebsiteContext(url);
    const raw = await grokChatJSON<PublicTeaserResult>([
      { role: "system", content: PUBLIC_TEASER_SYSTEM },
      {
        role: "user",
        content: `Write the 4-line teaser from this scrape.

URL: ${site.final_url}
Title: ${site.title || ""}
Meta: ${site.meta_description || ""}

Page text:
${site.text_excerpt.slice(0, 4500)}`,
      },
    ]);
    const result = clipTeaser(raw);
    if (
      !result.likely_buyer ||
      !result.unproven_assumption ||
      !result.price_hypothesis ||
      !result.next_conversation
    ) {
      return NextResponse.json(
        { error: "Could not form a useful read on that page. Try another public URL." },
        { status: 422 }
      );
    }

    if (urlCache.size > 200) {
      const oldest = urlCache.keys().next().value;
      if (oldest) urlCache.delete(oldest);
    }
    urlCache.set(key, { at: Date.now(), result });
    ipBuckets.set(ipKey, { day, n: used + 1 });

    const res = NextResponse.json({ url: site.final_url, result });
    res.cookies.set(COOKIE, `${day}|${used + 1}`, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      httpOnly: true,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: publicTeaserError(err) }, { status: 422 });
  }
}

function publicTeaserError(err: unknown): string {
  const m = err instanceof Error ? err.message : "";
  if (m.includes("timed out")) {
    return "That page timed out. Check it is public and try again.";
  }
  if (m.includes("Could not reach") || m.includes("returned")) return m;
  if (m.includes("valid public URL")) {
    return "Paste a public product URL like https://yourproduct.com";
  }
  if (m.includes("HTML page")) {
    return "That URL did not return a public web page we can read.";
  }
  if (m.includes("readable text") || m.includes("Traction")) {
    return "That page had almost no readable text. Check it is public HTML and try again.";
  }
  return "Could not read that URL. Check it is public and try again.";
}
