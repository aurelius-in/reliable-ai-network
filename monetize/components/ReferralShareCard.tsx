"use client";

import { useState } from "react";
import { Check, Copy, Gift } from "lucide-react";
import { referralSharePath } from "@/lib/referrals";

export function ReferralShareCard({
  code,
  rewardedCount,
  appUrl,
}: {
  code: string;
  rewardedCount: number;
  appUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const link = `${appUrl.replace(/\/$/, "")}${referralSharePath(code)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-2xl border border-night-600 bg-night-700 p-6">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
        <Gift size={16} /> Refer a builder
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        When someone signs up with your link, finishes the 30-day free trial,
        and pays their first bill, you get credit equal to half of what they
        paid that first month. Every person you refer like that adds more
        credit to your account.
      </p>
      {rewardedCount > 0 && (
        <p className="mt-2 text-sm text-aqua-bright">
          {rewardedCount} successful referral{rewardedCount === 1 ? "" : "s"} so
          far.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate rounded-xl border border-night-600 bg-night-800 px-3 py-2.5 text-sm text-aqua-bright">
          {link}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-night-600 bg-night-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-aqua/40 hover:text-aqua-bright"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Your code: <span className="font-semibold text-slate-300">{code}</span>
      </p>
    </div>
  );
}
