/**
 * Referral program.
 * - After a referred friend finishes trial and pays their first bill,
 *   referrer gets 50% of that invoice's amount_paid as Stripe credit.
 * - Credits stack per paying referral. No lifetime cap.
 * - Promos (RAIN26 / RAINVIP) already reduce amount_paid, so payouts
 *   follow cash collected. No automatic referee discount beyond that.
 */

/** Fraction of the referee's first paid invoice credited to the referrer. */
export const REFERRAL_CREDIT_FRACTION = 0.5;

export const REFERRAL_STORAGE_KEY = "rain_ref";

export function referralCreditCents(amountPaidCents: number): number {
  if (amountPaidCents <= 0) return 0;
  return Math.floor(amountPaidCents * REFERRAL_CREDIT_FRACTION);
}

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length >= 4 && code.length <= 16 ? code : null;
}

export function makeReferralCode(): string {
  // 8 hex chars — same shape as SQL backfill
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function referralSharePath(code: string): string {
  return `/signup?ref=${encodeURIComponent(code)}`;
}
