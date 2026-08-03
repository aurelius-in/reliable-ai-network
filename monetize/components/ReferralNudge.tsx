"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Users, X } from "lucide-react";
import { referralSharePath } from "@/lib/referrals";
import { track, trackUiClick } from "@/lib/track";

const DISMISS_KEY = "rain-referral-nudge";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 10_000;

function isSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    if (raw === "1") return true; // legacy forever-dismiss
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return true;
  }
}

function snooze() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* ignore */
  }
}

export function ReferralNudge({
  code,
  appUrl,
}: {
  code: string;
  appUrl: string;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = `${appUrl.replace(/\/$/, "")}${referralSharePath(code)}`;

  useEffect(() => {
    if (isSnoozed()) return;
    const t = window.setTimeout(() => {
      if (isSnoozed()) return;
      setVisible(true);
      track("referral_nudge_shown");
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    trackUiClick("referral_nudge_dismiss");
    snooze();
    setVisible(false);
  }

  async function copy() {
    trackUiClick("referral_nudge_copy");
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Refer builders and earn credit"
      className="fixed right-3 z-50 w-[min(100%-1.5rem,20.5rem)] overflow-hidden rounded-2xl border border-aqua/30 bg-night-800 shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(0,229,255,0.12)] animate-[fade-up_0.45s_ease-out_both] bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-6 md:right-6"
    >
      <div className="relative border-b border-white/10 px-4 pb-4 pt-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 90% at 85% 10%, rgba(0,229,255,0.22), transparent 55%), radial-gradient(90% 80% at 10% 90%, rgba(230,0,255,0.16), transparent 50%)",
          }}
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss referral tip"
          className="absolute right-2.5 top-2.5 z-10 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="relative flex items-start gap-3 pr-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mark.jpg"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-aqua/40 shadow-[0_0_18px_rgba(0,229,255,0.28)]"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-aqua">
              Refer builders
            </p>
            <p className="mt-1 text-lg font-extrabold leading-snug text-white">
              Earn half their first bill
            </p>
          </div>
        </div>

        <div className="relative mt-3 flex items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-aqua/15 text-aqua ring-1 ring-aqua/30">
            <Users size={14} />
          </span>
          <span>
            They finish the trial and pay once. You get{" "}
            <strong className="font-semibold text-aqua-bright">50% credit</strong>{" "}
            on that invoice. Stacks, no cap.
          </span>
        </div>
      </div>

      <div className="space-y-2.5 bg-night-700/80 px-4 py-3.5">
        <button
          type="button"
          onClick={copy}
          className="btn-primary flex w-full items-center justify-center gap-2 !py-2.5 text-sm"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Link copied" : "Copy referral link"}
        </button>
        <Link
          href="/billing"
          onClick={() => {
            trackUiClick("referral_nudge_billing");
            snooze();
          }}
          className="block text-center text-xs font-medium text-slate-400 transition hover:text-aqua-bright"
        >
          See full referral details
        </Link>
      </div>
    </aside>
  );
}
