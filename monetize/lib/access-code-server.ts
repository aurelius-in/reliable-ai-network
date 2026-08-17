import {
  grantEndsAt,
  isComplimentaryAccessActive,
  lookupAccessCode,
  RETENTION_KEEP_CODE,
  type AccessCodeGrant,
} from "@/lib/access-codes";
import type { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

export async function redeemAccessCode(
  admin: Admin,
  userId: string,
  rawCode: string
): Promise<
  | { ok: true; grant: AccessCodeGrant; endsAt: string; alreadyActive?: boolean }
  | { ok: false; error: string; status: number }
> {
  const grant = lookupAccessCode(rawCode);
  if (!grant || grant.publicRedeem === false) {
    return { ok: false, error: "Invalid access code.", status: 400 };
  }

  const { data: profile, error: readError } = await admin
    .from("profiles")
    .select("subscription_status, current_tier, trial_ends_at")
    .eq("id", userId)
    .single();

  if (readError || !profile) {
    return { ok: false, error: "Profile not found.", status: 404 };
  }

  const status = profile.subscription_status;
  if (status === "active" || status === "past_due") {
    return {
      ok: false,
      error:
        "This account already has a paid subscription. Manage it from Billing.",
      status: 409,
    };
  }

  if (
    isComplimentaryAccessActive({
      subscription_status: profile.subscription_status,
      current_tier: profile.current_tier,
      trial_ends_at: profile.trial_ends_at,
    })
  ) {
    if (grant.extendIfActive) {
      const currentEnd = profile.trial_ends_at
        ? new Date(profile.trial_ends_at).getTime()
        : 0;
      const offeredEnd = new Date(grantEndsAt(grant.durationDays)).getTime();
      const endsAt = new Date(Math.max(currentEnd, offeredEnd)).toISOString();
      if (offeredEnd > currentEnd) {
        const { error: updateError } = await admin
          .from("profiles")
          .update({
            current_tier: grant.tier,
            subscription_status: grant.status,
            trial_ends_at: endsAt,
          })
          .eq("id", userId);
        if (updateError) {
          return { ok: false, error: updateError.message, status: 500 };
        }
        return { ok: true, grant, endsAt };
      }
    }
    return {
      ok: true,
      grant,
      endsAt: profile.trial_ends_at ?? grantEndsAt(grant.durationDays),
      alreadyActive: true,
    };
  }

  const endsAt = grantEndsAt(grant.durationDays);

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      current_tier: grant.tier,
      subscription_status: grant.status,
      trial_ends_at: endsAt,
    })
    .eq("id", userId);

  if (updateError) {
    return { ok: false, error: updateError.message, status: 500 };
  }

  return { ok: true, grant, endsAt };
}

/** Apply the cancel-retention keep offer (RAIN60KEEP). Not publicly redeemable. */
export async function applyRetentionKeepOffer(
  admin: Admin,
  userId: string
): Promise<
  | { ok: true; grant: AccessCodeGrant; endsAt: string }
  | { ok: false; error: string; status: number }
> {
  const grant = lookupAccessCode(RETENTION_KEEP_CODE);
  if (!grant) {
    return { ok: false, error: "Retention offer not configured.", status: 500 };
  }

  const endsAt = grantEndsAt(grant.durationDays);

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      current_tier: grant.tier,
      subscription_status: grant.status,
      trial_ends_at: endsAt,
    })
    .eq("id", userId);

  if (updateError) {
    return { ok: false, error: updateError.message, status: 500 };
  }

  return { ok: true, grant, endsAt };
}
