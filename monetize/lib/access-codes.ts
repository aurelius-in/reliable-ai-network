/**
 * App-side access codes (not Stripe promotion codes).
 * Used for no-card reviewer / complimentary / retention access.
 */

import type { TierName } from "@/lib/tiers";

export const ACCESS_CODE_STORAGE_KEY = "rain_access_code";

/** Complimentary statuses that bypass Stripe billing while active. */
export type CompStatus = "reviewer" | "retention";

export type AccessCodeGrant = {
  code: string;
  tier: TierName;
  /** profiles.subscription_status value */
  status: CompStatus;
  /** Calendar days of Pro access from redeem time. */
  durationDays: number;
  label: string;
  description: string;
  /**
   * When false, code cannot be redeemed via the public redeem API.
   * Applied only by server flows (e.g. cancel retention offer).
   */
  publicRedeem?: boolean;
};

const CODES: Record<string, AccessCodeGrant> = {
  RAIN26ADMIN: {
    code: "RAIN26ADMIN",
    tier: "pro",
    status: "reviewer",
    durationDays: 90,
    label: "Reviewer access",
    description:
      "Three months of Pro for product reviewers — no card required.",
    publicRedeem: true,
  },
  /** Cancel-retention offer: applied server-side only, not advertised. */
  RAIN60KEEP: {
    code: "RAIN60KEEP",
    tier: "pro",
    status: "retention",
    durationDays: 60,
    label: "Keep Pro offer",
    description:
      "Sixty days of Pro after cancel intent — no further card charges.",
    publicRedeem: false,
  },
};

export const RETENTION_KEEP_CODE = "RAIN60KEEP";

export function normalizeAccessCode(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length >= 4 && code.length <= 32 ? code : null;
}

export function lookupAccessCode(
  raw: string | null | undefined
): AccessCodeGrant | null {
  const code = normalizeAccessCode(raw);
  if (!code) return null;
  return CODES[code] ?? null;
}

export function grantEndsAt(durationDays: number, from = new Date()): string {
  const end = new Date(from.getTime());
  end.setUTCDate(end.getUTCDate() + durationDays);
  return end.toISOString();
}

/** @deprecated use grantEndsAt */
export const reviewerEndsAt = grantEndsAt;

export function isComplimentaryStatus(
  status: string | null | undefined
): boolean {
  return status === "reviewer" || status === "retention";
}

export function isComplimentaryAccessActive(profile: {
  subscription_status: string | null;
  trial_ends_at: string | null;
  current_tier: string | null;
}): boolean {
  if (!isComplimentaryStatus(profile.subscription_status)) return false;
  if (!profile.current_tier) return false;
  if (!profile.trial_ends_at) return true;
  return new Date(profile.trial_ends_at).getTime() > Date.now();
}

/** @deprecated use isComplimentaryAccessActive */
export const isReviewerAccessActive = isComplimentaryAccessActive;
