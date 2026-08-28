import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CreditCard } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { MobileTabBar } from "@/components/MobileTabBar";
import { ManageSubscription } from "@/components/ManageSubscription";
import { CheckoutButton } from "@/components/CheckoutButton";
import { ReferralShareCard } from "@/components/ReferralShareCard";
import { ReferralAttributor } from "@/components/ReferralAttributor";
import { AccessCodeAutoRedeem } from "@/components/AccessCodeAutoRedeem";
import { AccessCodeForm } from "@/components/AccessCodeForm";
import { ConfirmEmailBanner } from "@/components/ConfirmEmailBanner";
import { PaidNextOffer } from "@/components/PaidNextOffer";
import { isComplimentaryStatus } from "@/lib/access-codes";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureReferralCode } from "@/lib/referral-server";
import { getAppUrl } from "@/lib/stripe";
import { TIERS, tierLabel, trialDaysLeft } from "@/lib/tiers";
import type { Profile } from "@/types";

export const metadata = { title: "Billing — Make it RAIN" };

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free trial",
  reviewer: "Reviewer (no card)",
  retention: "Complimentary Pro",
  active: "Active",
  past_due: "Past due — payment failed",
  canceled: "Canceled",
  incomplete: "Incomplete",
  unpaid: "Unpaid",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/billing");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = data as Profile | null;

  const admin = createAdminClient();
  const referralCode =
    profile?.referral_code || (await ensureReferralCode(admin, user.id));

  const { count: rewardedCount } = await supabase
    .from("referral_rewards")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("status", "credited");

  const status = profile?.subscription_status;
  const isComp = isComplimentaryStatus(status);
  const hasSubscription =
    !!status && status !== "canceled" && !isComplimentaryStatus(status);
  const isTrialing = status === "trialing";
  const days = trialDaysLeft(profile?.trial_ends_at);
  const trialEndDate = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const tierInfo = TIERS.find((t) => t.id === profile?.current_tier);

  return (
    <div className="min-h-screen">
      <TopNav profile={profile} />

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-8">
        <ReferralAttributor />
        <ConfirmEmailBanner />
        <h1 className="text-2xl font-semibold tracking-tight text-white">Billing</h1>

        {!hasSubscription && !isComp ? (
          <PaidNextOffer placement="billing" />
        ) : null}
        {hasSubscription && !isComp ? (
          <PaidNextOffer placement="billing" mode="select_only" />
        ) : null}

        {isTrialing && trialEndDate && (
          <div className="fade-up rounded-2xl border border-rain/40 bg-gradient-to-r from-rain/10 to-night-700 p-6">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rain-bright">
              <CalendarClock size={16} /> Trial ending
            </p>
            <p className="mt-2 text-xl font-bold text-white">
              Your free {tierLabel(profile?.current_tier)} trial ends in{" "}
              {days} day{days === 1 ? "" : "s"} — on {trialEndDate}.
            </p>
            <p className="mt-1.5 text-sm text-slate-300">
              After that, your card is charged ${tierInfo?.price ?? 100}/mo
              automatically. To change or end your plan, use Manage subscription
              below.
            </p>
          </div>
        )}

        {isComp && (
          <div className="fade-up rounded-2xl border border-violet/40 bg-gradient-to-r from-violet/10 to-night-700 p-6">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
              <CalendarClock size={16} />{" "}
              {status === "retention" ? "Complimentary access" : "Reviewer access"}
            </p>
            <p className="mt-2 text-xl font-bold text-white">
              Full {tierLabel(profile?.current_tier)} access
              {trialEndDate
                ? ` through ${trialEndDate}`
                : " (complimentary)"}
              {days != null ? ` · ${days} day${days === 1 ? "" : "s"} left` : ""}.
            </p>
            <p className="mt-1.5 text-sm text-slate-300">
              No active paid billing on this account during complimentary access.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-night-600 bg-night-700 p-6">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <CreditCard size={16} /> Current plan
          </p>

          {isComp ? (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black text-white">
                  {tierLabel(profile?.current_tier)}
                </span>
                <span className="rounded-full bg-violet/15 px-3 py-1 text-xs font-bold text-violet-bright ring-1 ring-violet/40">
                  {STATUS_LABELS[status!] ?? status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                No paid Stripe billing while complimentary access is active.
              </p>
            </>
          ) : hasSubscription ? (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black text-white">
                  {tierLabel(profile?.current_tier)}
                </span>
                {tierInfo && (
                  <span className="text-slate-400">${tierInfo.price}/mo</span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    status === "past_due"
                      ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/40"
                      : "bg-rain/15 text-rain-bright ring-1 ring-rain/40"
                  }`}
                >
                  {STATUS_LABELS[status!] ?? status}
                </span>
              </div>

              <div className="mt-6">
                <ManageSubscription
                  tierLabel={tierLabel(profile?.current_tier)}
                  price={tierInfo?.price}
                />
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-xl font-bold text-white">
                {status === "canceled" ? "Subscription ended" : "No subscription yet"}
              </p>
              <p className="mt-1.5 text-sm text-slate-300">
                {status === "canceled"
                  ? "Rejoin to get every tool back — manage or cancel anytime."
                  : "Pick a plan and start your 30-day free trial — card upfront, cancel anytime before day 30 and pay nothing."}
              </p>
              <div className="mt-5 max-w-xs">
                <CheckoutButton
                  tier="pro"
                  authenticated
                  label={
                    status === "canceled"
                      ? "Rejoin Pro"
                      : "Start 30-day free trial"
                  }
                />
              </div>
            </>
          )}
        </div>

        <AccessCodeAutoRedeem />
        {status !== "active" && status !== "past_due" ? (
          <AccessCodeForm
            heading={
              isComp
                ? "Have a code to extend access?"
                : "Have a feedback or reviewer code?"
            }
          />
        ) : null}

        {referralCode && (
          <ReferralShareCard
            code={referralCode}
            rewardedCount={rewardedCount ?? 0}
            appUrl={getAppUrl()}
          />
        )}

        <div className="rounded-2xl border border-night-600 bg-night-700/60 p-6 text-sm text-slate-400">
          <p>
            Want a different plan? Compare tiers on the{" "}
            <Link
              href="/pricing"
              className="font-semibold text-rain-bright hover:underline"
            >
              pricing page
            </Link>
            {hasSubscription &&
              ". Use Manage subscription to change plan or payment method"}
            .
          </p>
        </div>
      </main>

      <MobileTabBar tier={profile?.current_tier ?? null} />
    </div>
  );
}
