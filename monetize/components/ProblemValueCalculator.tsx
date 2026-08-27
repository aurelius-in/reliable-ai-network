"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import { track, trackUiClick } from "@/lib/track";
import { formatUsd } from "@/lib/deal-economics";
import {
  DEFAULT_PROBLEM_VALUE,
  computeProblemValue,
  type ProblemValueInput,
} from "@/lib/problem-value";

function numField(
  label: string,
  value: number,
  onChange: (n: number) => void,
  hint?: string
) {
  return (
    <label className="block text-left">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type="number"
        min={0}
        step="1"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-dark mt-1 !py-2.5"
      />
      {hint ? (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

export function ProblemValueCalculator({
  signupHref = "/signup?from=unpaid-month",
  primaryHref = "#home-product-url",
}: {
  signupHref?: string;
  /** Brand CTA. On the homepage this jumps to the URL field. */
  primaryHref?: string;
}) {
  const [input, setInput] = useState<ProblemValueInput>(DEFAULT_PROBLEM_VALUE);
  const tracked = useRef(false);
  const result = useMemo(() => computeProblemValue(input), [input]);

  useEffect(() => {
    track("problem_value_calc_view");
  }, []);

  function patch(partial: Partial<ProblemValueInput>) {
    if (!tracked.current) {
      tracked.current = true;
      trackUiClick("problem_value_calc_interact");
    }
    setInput((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-night-800/80 p-4 text-left sm:p-6">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        <Calculator size={14} /> One problem. Not 15 tools.
      </p>
      <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
        What is another unpaid month costing you?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        A few of your numbers. Immediate economics. No URL. This is the cost of
        guessing who may pay, not a promised sale.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {numField(
          "Product revenue this month",
          input.revenueThisMonth,
          (revenueThisMonth) => patch({ revenueThisMonth }),
          "$0 is fine. That is the usual starting point."
        )}
        {numField(
          "Hours/week still on this product",
          input.hoursPerWeek,
          (hoursPerWeek) => patch({ hoursPerWeek }),
          "Build, polish, hoping. Not a paying conversation."
        )}
        {numField(
          "What an hour of your time is worth",
          input.hourlyRate,
          (hourlyRate) => patch({ hourlyRate })
        )}
        {numField(
          "Price you wish you could charge (optional)",
          input.priceTheyWant,
          (priceTheyWant) => patch({ priceTheyWant }),
          "Leave 0 if you do not know yet."
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-aqua/40 bg-aqua/10 px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Unpaid-month hole
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {formatUsd(Math.max(0, result.hole))}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-night-900/40 px-3 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Time you put in
          </p>
          <p className="mt-1 text-lg font-black text-white">
            {formatUsd(result.timeCost)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold leading-relaxed text-white">
        {result.headline}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
        {result.detail}
      </p>
      {result.starterVsHole != null && result.hole > 29 ? (
        <p className="mt-2 text-xs text-slate-500">
          If you later upgrade, Starter is $29/mo. That is a labeled comparison
          to this month&apos;s time cost, not a guaranteed return.
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <TrackedLink
          href={primaryHref}
          trackTarget="problem_value_cta_url"
          className="btn-primary inline-flex items-center justify-center gap-2 !px-5 !py-3"
        >
          Run it on my product, free <ArrowRight size={16} />
        </TrackedLink>
        <TrackedLink
          href={signupHref}
          trackTarget="problem_value_cta_signup"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-aqua/50"
        >
          Save for First Customer Path
        </TrackedLink>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Proposal math, closer pay, and what you should charge live inside after
        you save an account. That is a different calculator.
      </p>
    </div>
  );
}
