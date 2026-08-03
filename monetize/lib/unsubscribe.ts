import { createHmac, timingSafeEqual } from "crypto";

export const COMPANY_MAILING_ADDRESS =
  "523 E 12th St., Mission, TX 78572, USA";

export const SUPPORT_EMAIL = "ai@reliableainetwork.com";

function unsubSecret(): string {
  return (
    process.env.UNSUBSCRIBE_SECRET?.trim() ||
    process.env.ADMIN_STATS_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "rain-unsub-dev-only"
  );
}

export function makeUnsubscribeToken(email: string): string {
  return createHmac("sha256", unsubSecret())
    .update(email.trim().toLowerCase())
    .digest("base64url");
}

export function verifyUnsubscribeToken(
  email: string,
  token: string | null | undefined
): boolean {
  if (!token) return false;
  const expected = makeUnsubscribeToken(email);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const e = encodeURIComponent(email.trim().toLowerCase());
  const t = encodeURIComponent(makeUnsubscribeToken(email));
  return `${base}/unsubscribe?email=${e}&token=${t}`;
}
