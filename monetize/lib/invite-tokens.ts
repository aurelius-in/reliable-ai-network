/**
 * Opaque public invite tokens → internal access codes.
 * Never put ADMIN / ROOT / BYPASS in a customer-visible URL.
 */

import { lookupAccessCode, type AccessCodeGrant } from "@/lib/access-codes";

export type InviteKind = "reviewer";

export type InviteGrant = {
  /** Opaque path segment, e.g. /invite/reviewer */
  token: string;
  /** Maps to access-codes.ts */
  accessCode: string;
  kind: InviteKind;
  /** For analytics / admin notify */
  label: string;
};

/**
 * Public invite tokens. Prefer short memorable tokens over secrets-looking ADMIN strings.
 * Anyone with the link gets the mapped grant (same as old shared RAIN26ADMIN link).
 */
const INVITES: Record<string, InviteGrant> = {
  reviewer: {
    token: "reviewer",
    accessCode: "RAIN26ADMIN",
    kind: "reviewer",
    label: "Complimentary reviewer invite",
  },
  /** Longer opaque alias for DMs (same entitlement). */
  "7f3c9a2e81": {
    token: "7f3c9a2e81",
    accessCode: "RAIN26ADMIN",
    kind: "reviewer",
    label: "Complimentary reviewer invite",
  },
};

export function normalizeInviteToken(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return t.length >= 4 && t.length <= 64 ? t : null;
}

export function lookupInviteToken(
  raw: string | null | undefined
): (InviteGrant & { grant: AccessCodeGrant }) | null {
  const token = normalizeInviteToken(raw);
  if (!token) return null;
  const invite = INVITES[token];
  if (!invite) return null;
  const grant = lookupAccessCode(invite.accessCode);
  if (!grant || grant.publicRedeem === false) return null;
  return { ...invite, grant };
}

/** Canonical public URL path for reviewer invites (no ADMIN in query). */
export const DEFAULT_REVIEWER_INVITE_PATH = "/invite/reviewer";

export function isLegacyAdminAccessParam(
  raw: string | null | undefined
): boolean {
  return (raw ?? "").trim().toUpperCase() === "RAIN26ADMIN";
}
