import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeReferralCode } from "@/lib/referrals";

/** Postgres error code for a foreign-key violation. */
const FOREIGN_KEY_VIOLATION = "23503";

type DbError = { code?: string; message?: string } | null;

/**
 * Creates the user's profiles row if it's missing (users who signed up
 * before the on_auth_user_created trigger was installed have none, which
 * makes every insert referencing profiles(id) fail its foreign key).
 * Uses the service-role client because RLS has no insert policy on profiles.
 */
export async function ensureProfile(user: User): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const email = user.email ?? "";
    const { error } = await admin.from("profiles").upsert(
      {
        id: user.id,
        email,
        name:
          (user.user_metadata?.name as string | undefined) ??
          (email ? email.split("@")[0] : null),
        referral_code: makeReferralCode(),
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (error) {
      console.error("Failed to repair missing profile:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to repair missing profile:", err);
    return false;
  }
}

/**
 * Runs a write that references profiles(id); if it fails with a
 * foreign-key violation (missing profile row), repairs the profile
 * and retries once.
 */
export async function withProfileRepair<
  Q extends PromiseLike<{ error: DbError }>,
>(user: User, run: () => Q): Promise<Awaited<Q>> {
  let result = (await run()) as Awaited<Q>;
  if (
    result.error?.code === FOREIGN_KEY_VIOLATION &&
    (await ensureProfile(user))
  ) {
    result = (await run()) as Awaited<Q>;
  }
  return result;
}
