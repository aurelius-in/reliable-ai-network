/** Persist a homepage-pasted product URL through signup → onboarding. */

export const PENDING_PRODUCT_URL_KEY = "rain_pending_product_url";
export const PENDING_TEASER_KEY = "rain_pending_teaser";

export function normalizeProductUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function savePendingProductUrl(raw: string): string {
  const url = normalizeProductUrl(raw);
  if (typeof sessionStorage === "undefined") return url;
  try {
    if (url) sessionStorage.setItem(PENDING_PRODUCT_URL_KEY, url);
    else sessionStorage.removeItem(PENDING_PRODUCT_URL_KEY);
  } catch {
    /* ignore */
  }
  return url;
}

export function readPendingProductUrl(): string {
  if (typeof sessionStorage === "undefined") return "";
  try {
    return sessionStorage.getItem(PENDING_PRODUCT_URL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function hostnameFromProductUrl(raw: string): string {
  try {
    const url = new URL(normalizeProductUrl(raw));
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export type PendingTeaser = {
  url: string;
  product_name: string;
  likely_buyer: string;
  unproven_assumption: string;
  price_hypothesis: string;
  next_conversation: string;
};

export function savePendingTeaser(teaser: PendingTeaser): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_TEASER_KEY, JSON.stringify(teaser));
  } catch {
    /* ignore */
  }
}

export function readPendingTeaser(): PendingTeaser | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_TEASER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingTeaser;
    if (!parsed?.url || !parsed.likely_buyer) return null;
    return parsed;
  } catch {
    return null;
  }
}

function teaserCacheKey(url: string): string {
  return `rain_teaser_cache:${normalizeProductUrl(url).toLowerCase()}`;
}

export function readCachedTeaser(url: string): PendingTeaser | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(teaserCacheKey(url));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingTeaser;
    if (!parsed?.likely_buyer) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedTeaser(teaser: PendingTeaser): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(teaserCacheKey(teaser.url), JSON.stringify(teaser));
  } catch {
    /* ignore */
  }
}
