import { createAdminClient } from "@/lib/supabase/admin";
import { makeReferralCode, normalizeReferralCode } from "@/lib/referrals";

type Admin = ReturnType<typeof createAdminClient>;

/** Ensures the user has a referral_code; returns it. */
export async function ensureReferralCode(
  admin: Admin,
  userId: string
): Promise<string | null> {
  const { data } = await admin
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();

  if (data?.referral_code) return data.referral_code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeReferralCode();
    const { data: updated, error } = await admin
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId)
      .is("referral_code", null)
      .select("referral_code")
      .maybeSingle();

    if (!error && updated?.referral_code) return updated.referral_code;

    const { data: again } = await admin
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .maybeSingle();
    if (again?.referral_code) return again.referral_code;
  }

  return null;
}

/**
 * Attribute a signup to a referrer by code.
 * Only sets referred_by once; ignores self-referral and unknown codes.
 */
export async function applyReferralCode(
  admin: Admin,
  userId: string,
  rawCode: string | null | undefined
): Promise<{ ok: boolean; reason?: string }> {
  const code = normalizeReferralCode(rawCode);
  if (!code) return { ok: false, reason: "invalid" };

  const { data: me } = await admin
    .from("profiles")
    .select("id, referred_by, referral_code")
    .eq("id", userId)
    .maybeSingle();

  if (!me) return { ok: false, reason: "no_profile" };
  if (me.referred_by) return { ok: false, reason: "already_set" };
  if (me.referral_code && me.referral_code === code) {
    return { ok: false, reason: "self" };
  }

  const { data: referrer } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();

  if (!referrer || referrer.id === userId) {
    return { ok: false, reason: "not_found" };
  }

  const { error } = await admin
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", userId)
    .is("referred_by", null);

  if (error) {
    console.error("applyReferralCode failed:", error);
    return { ok: false, reason: "db" };
  }

  return { ok: true };
}
