import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CreditCard } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PortalButton } from "@/components/PortalButton";
import { CheckoutButton } from "@/components/CheckoutButton";
import { createClient } from "@/lib/supabase/server";
import { TIERS, tierLabel, trialDaysLeft } from "@/lib/tiers";
import type { Profile } from "@/types";

export const metadata = { title: "Billing — Make it Rain" };

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free trial",
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

  const status = profile?.subscription_status;
  const hasSubscription = !!status && status !== "canceled";
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

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-black text-white">Billing</h1>

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
              automatically. Don&apos;t want that? Cancel below in one click —
              you keep access until the trial ends.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-night-600 bg-night-700 p-6">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <CreditCard size={16} /> Current plan
          </p>

          {hasSubscription ? (
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

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <PortalButton label="Manage / Cancel subscription" />
                <p className="text-xs text-slate-500">
                  Opens the secure Stripe portal — cancel, upgrade, downgrade,
                  or update your card.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-xl font-bold text-white">
                {status === "canceled" ? "Subscription ended" : "No subscription yet"}
              </p>
              <p className="mt-1.5 text-sm text-slate-300">
                Start free 30-day trial — full access to every tool,
                cancel anytime before day 30 and pay nothing.
              </p>
              <div className="mt-5 max-w-xs">
                <CheckoutButton
                  tier="pro"
                  authenticated
                  label="Start free 30-day trial"
                />
              </div>
            </>
          )}
        </div>

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
              " — upgrades and downgrades happen through the Stripe portal above and take effect immediately"}
            .
          </p>
        </div>
      </main>
    </div>
  );
}
