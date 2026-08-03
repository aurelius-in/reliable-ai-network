import { referralCreditCents } from "@/lib/referrals";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * After a referred user's first real paid invoice (post-trial), credit the
 * referrer 50% of amount_paid on their Stripe customer balance. No cap.
 * One reward per referee (unique referee_id).
 */
export async function maybeCreditReferralReward(
  admin: Admin,
  refereeUserId: string,
  invoiceId: string,
  amountPaid: number
): Promise<void> {
  if (!refereeUserId || amountPaid <= 0) return;

  const creditCents = referralCreditCents(amountPaid);
  if (creditCents <= 0) return;

  const { data: referee } = await admin
    .from("profiles")
    .select("id, referred_by")
    .eq("id", refereeUserId)
    .maybeSingle();

  const referrerId = referee?.referred_by;
  if (!referrerId) return;

  if (referrerId === refereeUserId) {
    await admin.from("referral_rewards").upsert(
      {
        referrer_id: referrerId,
        referee_id: refereeUserId,
        stripe_invoice_id: invoiceId,
        credit_cents: 0,
        status: "skipped_self",
      },
      { onConflict: "referee_id" }
    );
    return;
  }

  // Already rewarded for this referee?
  const { data: existing } = await admin
    .from("referral_rewards")
    .select("id, status")
    .eq("referee_id", refereeUserId)
    .maybeSingle();
  if (existing) return;

  const { data: referrer } = await admin
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("id", referrerId)
    .maybeSingle();

  if (!referrer?.stripe_customer_id) {
    await admin.from("referral_rewards").insert({
      referrer_id: referrerId,
      referee_id: refereeUserId,
      stripe_invoice_id: invoiceId,
      credit_cents: 0,
      status: "skipped_no_customer",
    });
    return;
  }

  // Insert first (unique referee_id) so concurrent webhooks don't double-pay.
  const { error: insertError } = await admin.from("referral_rewards").insert({
    referrer_id: referrerId,
    referee_id: refereeUserId,
    stripe_invoice_id: invoiceId,
    credit_cents: creditCents,
    status: "credited",
  });

  if (insertError) {
    // Unique violation = already handled
    if (insertError.code === "23505") return;
    console.error("referral_rewards insert failed:", insertError);
    return;
  }

  try {
    await getStripe().customers.createBalanceTransaction(
      referrer.stripe_customer_id,
      {
        amount: -creditCents,
        currency: "usd",
        description: `Referral credit — 50% of friend's first paid invoice (${invoiceId})`,
        metadata: {
          referee_user_id: refereeUserId,
          stripe_invoice_id: invoiceId,
          amount_paid_cents: String(amountPaid),
          credit_cents: String(creditCents),
          program: "pct50_first_invoice_v2",
        },
      }
    );
  } catch (err) {
    console.error("Stripe referral credit failed:", err);
    // Keep the row so we don't retry into a double-credit mess; founder can fix manually.
  }
}
