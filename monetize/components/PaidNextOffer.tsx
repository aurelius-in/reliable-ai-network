"use client";

import Link from "next/link";
import { track } from "@/lib/track";
import { PAID_NEXT } from "@/lib/paid-next";

export function PaidNextOffer({
  placement,
  mode = "full",
}: {
  placement: "dashboard" | "first_run" | "pricing" | "billing";
  mode?: "full" | "select_only";
}) {
  function trackMir() {
    track("activate_trial_click", { status: "none", placement });
    track("paid_next_trial_click", { placement });
  }

  function trackSelect() {
    track("paid_next_select_click", { placement });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/12 bg-[#0b0f18]">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          {mode === "select_only" ? PAID_NEXT.selectEyebrow : PAID_NEXT.kicker}
        </p>
        <h2 className="mt-3 max-w-2xl text-[1.35rem] font-semibold leading-snug tracking-tight text-white sm:text-[1.65rem]">
          {mode === "select_only" ? PAID_NEXT.selectTitle : PAID_NEXT.headline}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-400">
          {mode === "select_only" ? PAID_NEXT.selectBody : PAID_NEXT.support}
        </p>
      </div>

      <div className={`grid ${mode === "full" ? "lg:grid-cols-2" : ""}`}>
        {mode === "full" ? (
          <div className="border-b border-white/10 px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              {PAID_NEXT.mirEyebrow}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {PAID_NEXT.mirTitle}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {PAID_NEXT.mirBody}
            </p>
            <p className="mt-4 text-sm text-slate-200">{PAID_NEXT.mirProof}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={PAID_NEXT.mirCheckout}
                onClick={trackMir}
                className="inline-flex items-center bg-white px-5 py-2.5 text-sm font-semibold text-[#0b0f18] transition hover:bg-slate-200"
              >
                {PAID_NEXT.mirCta}
              </Link>
              <Link
                href={PAID_NEXT.mirPlans}
                onClick={() => track("paid_next_plans_click", { placement })}
                className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline"
              >
                Compare plans
              </Link>
              <Link
                href={PAID_NEXT.mirGuarantee}
                className="text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline"
              >
                Guarantee terms
              </Link>
            </div>
          </div>
        ) : null}

        <div className="bg-black px-6 py-7 sm:px-8">
          {mode === "full" ? (
            <>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                {PAID_NEXT.selectEyebrow}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {PAID_NEXT.selectTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {PAID_NEXT.selectBody}
              </p>
            </>
          ) : null}
          <p className={`${mode === "full" ? "mt-4" : "mt-0"} text-sm text-zinc-200`}>
            {PAID_NEXT.selectProof}
          </p>
          <a
            href={PAID_NEXT.selectHref}
            onClick={trackSelect}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center border border-white/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
          >
            {PAID_NEXT.selectCta}
          </a>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-zinc-600">
            Separate engagement. Selection is a commercial fit decision. Early
            or unpaid-only products remain on the Make it RAIN trial.
          </p>
        </div>
      </div>
    </section>
  );
}
