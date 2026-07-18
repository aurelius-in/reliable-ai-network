import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { tierLabel, trialDaysLeft } from "@/lib/tiers";
import type { Profile } from "@/types";

export function TrialBanner({ profile }: { profile: Profile | null }) {
  const status = profile?.subscription_status;

  if (status === "trialing" && profile?.trial_ends_at) {
    const days = trialDaysLeft(profile.trial_ends_at) ?? 0;
    const endDate = new Date(profile.trial_ends_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return (
      <div className="fade-up rounded-2xl border border-rain/30 bg-gradient-to-r from-rain/10 via-night-700 to-violet/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-semibold text-white">
            <Sparkles size={18} className="text-rain-bright" />
            You are on the {tierLabel(profile.current_tier)} trial — ends in{" "}
            <span className="text-rain-bright">
              {days} day{days === 1 ? "" : "s"}
            </span>
            <span className="text-sm font-normal text-slate-400">({endDate})</span>
          </p>
          <Link
            href="/billing"
            className="text-sm font-semibold text-pink underline-offset-4 transition hover:underline"
          >
            Manage trial →
          </Link>
        </div>
      </div>
    );
  }

  if (!status || status === "canceled") {
    return (
      <div className="fade-up rounded-2xl border border-rain/30 bg-gradient-to-r from-rain/10 via-night-700 to-violet/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-semibold text-white">
            <Zap size={18} className="text-rain-bright" />
            {status === "canceled"
              ? "Your subscription ended. Rejoin to keep making it rain."
              : "Start free 30-day trial — full access, cancel anytime."}
          </p>
          <Link
            href="/pricing"
            className="rounded-lg bg-gradient-to-r from-rain to-rain-bright px-4 py-2 text-sm font-bold text-white shadow shadow-rain/30 transition hover:brightness-110"
          >
            {status === "canceled" ? "Reactivate" : "Start free trial"}
          </Link>
        </div>
      </div>
    );
  }

  if (status === "past_due") {
    return (
      <div className="fade-up rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-white">
            Your last payment failed. Update your card to keep access.
          </p>
          <Link
            href="/billing"
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
          >
            Fix payment
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
