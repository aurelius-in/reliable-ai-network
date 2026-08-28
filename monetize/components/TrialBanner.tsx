"use client";

import Link from "next/link";
import { PaidNextOffer } from "@/components/PaidNextOffer";
import { RainBullet } from "@/components/RainBullet";
import { tierLabel, trialDaysLeft } from "@/lib/tiers";
import { track } from "@/lib/track";
import type { Profile } from "@/types";

export function TrialBanner({ profile }: { profile: Profile | null }) {
  const status = profile?.subscription_status;

  if (status === "reviewer" || status === "retention") {
    const days = trialDaysLeft(profile?.trial_ends_at);
    const endDate = profile?.trial_ends_at
      ? new Date(profile.trial_ends_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;
    const label =
      status === "retention" ? "Complimentary Pro" : "Reviewer access";
    return (
      <div className="fade-up rounded-2xl border border-violet/30 bg-gradient-to-r from-violet/10 via-night-700 to-aqua/10 px-5 py-4">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-semibold text-white">
          <RainBullet size={15} />
          {label} — full {tierLabel(profile?.current_tier)} toolkit
          {endDate ? (
            <>
              {" "}
              through{" "}
              <span className="text-aqua">{endDate}</span>
              {days != null && (
                <span className="text-xs font-normal text-slate-400">
                  ({days} day{days === 1 ? "" : "s"} left)
                </span>
              )}
            </>
          ) : null}
          . No active card charges.
        </p>
      </div>
    );
  }

  if (status === "trialing" && profile?.trial_ends_at) {
    const days = trialDaysLeft(profile.trial_ends_at) ?? 0;
    const endDate = new Date(profile.trial_ends_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return (
      <div className="fade-up rounded-2xl border border-aqua/25 bg-gradient-to-r from-aqua/10 via-night-700 to-rain/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-semibold text-white">
            <RainBullet size={15} />
            You are on the {tierLabel(profile.current_tier)} trial — ends in{" "}
            <span className="text-aqua">
              {days} day{days === 1 ? "" : "s"}
            </span>
            <span className="text-xs font-normal text-slate-400">({endDate})</span>
          </p>
          <Link
            href="/billing"
            onClick={() => track("manage_trial_click", { status: "trialing" })}
            className="text-xs font-semibold text-pink underline-offset-4 transition hover:underline"
          >
            Manage trial
          </Link>
        </div>
      </div>
    );
  }

  if (!status || status === "canceled") {
    return (
      <div className="fade-up space-y-3">
        {status === "canceled" ? (
          <p className="text-sm text-slate-400">
            Your subscription ended. Restart the trial or apply for RAIN Select
            if revenue is already in motion.
          </p>
        ) : null}
        <PaidNextOffer placement="dashboard" />
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
            onClick={() => track("fix_payment_click")}
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
