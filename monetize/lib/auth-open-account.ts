import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { maybeRedeemReviewerOnAuth } from "@/lib/redeem-reviewer-on-auth";

/**
 * Let someone use the product without clicking the confirmation email first.
 * Supabase "Confirm email" can stay on (it still sends the mail). We mark the
 * user confirmed so password login works, and they can click the link later.
 * We do not lock the account after a few days.
 */
export async function openAccountForUse(opts: {
  email: string;
  userId?: string | null;
  nextPath?: string | null;
}): Promise<{ ok: true; userId: string | null; alreadyConfirmed: boolean }> {
  const email = opts.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: true, userId: null, alreadyConfirmed: false };
  }

  const admin = createAdminClient();
  const user = await findAuthUser(admin, email, opts.userId);
  if (!user) {
    return { ok: true, userId: null, alreadyConfirmed: false };
  }

  const alreadyConfirmed = Boolean(user.email_confirmed_at);
  if (!alreadyConfirmed) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        confirm_later: true,
      },
    });
    if (error) {
      console.error("[open-account] confirm failed:", error.message);
      throw error;
    }
  }

  const { data: refreshed } = await admin.auth.admin.getUserById(user.id);
  const live = refreshed.user ?? user;
  await ensureProfile(live);
  try {
    await maybeRedeemReviewerOnAuth(live, opts.nextPath);
  } catch (err) {
    console.error("[open-account] reviewer redeem failed:", err);
  }

  return { ok: true, userId: user.id, alreadyConfirmed };
}

export async function markInboxVerified(user: User): Promise<void> {
  if (user.user_metadata?.inbox_verified === true) return;
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...(user.user_metadata ?? {}),
      inbox_verified: true,
      confirm_later: false,
    },
  });
  if (error) {
    console.error("[open-account] inbox verify failed:", error.message);
  }
}

async function findAuthUser(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  userId?: string | null
): Promise<User | null> {
  if (userId) {
    const { data } = await admin.auth.admin.getUserById(userId);
    const match = data.user?.email?.trim().toLowerCase();
    if (data.user && match === email) return data.user;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (profile?.id) {
    const { data } = await admin.auth.admin.getUserById(profile.id);
    if (data.user) return data.user;
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) {
    console.error("[open-account] listUsers failed:", error.message);
    return null;
  }
  return (
    data.users.find((u) => u.email?.trim().toLowerCase() === email) ?? null
  );
}
