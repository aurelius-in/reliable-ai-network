/**
 * Server-side reviewer grant after auth (signup confirm / OAuth callback).
 * Does not rely on browser localStorage surviving email confirmation.
 */

import type { User } from "@supabase/supabase-js";
import { redeemAccessCode } from "@/lib/access-code-server";
import { lookupInviteToken } from "@/lib/invite-tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/supabase/ensure-profile";

const DEFAULT_REVIEWER_CODE = "RAIN26ADMIN";

export function inviteTokenFromNextPath(
  nextPath: string | null | undefined
): string | null {
  if (!nextPath) return null;
  try {
    const u = new URL(nextPath, "http://local.invalid");
    return u.searchParams.get("invite");
  } catch {
    return null;
  }
}

/**
 * If the user signed up as a reviewer (metadata) or next carries ?invite=,
 * apply complimentary Pro. Safe to call repeatedly (idempotent while active).
 */
export async function maybeRedeemReviewerOnAuth(
  user: User,
  nextPath?: string | null
): Promise<void> {
  const meta = user.user_metadata?.signup_variant;
  const invite = lookupInviteToken(inviteTokenFromNextPath(nextPath));
  const isReviewer = meta === "reviewer" || Boolean(invite);
  if (!isReviewer) return;

  await ensureProfile(user);
  const admin = createAdminClient();
  const code = invite?.accessCode ?? DEFAULT_REVIEWER_CODE;
  await redeemAccessCode(admin, user.id, code);
}
