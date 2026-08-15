"use client";

import {
  toFounderFacingScore,
  toFounderFacingSurvival,
} from "@/lib/founder-facing-score";
import type { BuyerStressTestResult, IdeaAnalysis } from "@/types";

/** Compact Executive Brief for Analyzer results (mobile-first). */
export function AnalyzerExecutiveBrief({ analysis }: { analysis: IdeaAnalysis }) {
  const facing = toFounderFacingScore(analysis.score);
  const ca = analysis.commercial_answer;
  const next =
    analysis.validation_plan?.[0] ||
    analysis.quick_wins?.[0] ||
    "Run Buyer Stress Test before outreach.";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-night-600 bg-night-900/60 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Readiness
          </p>
          <p className="font-serif text-2xl font-semibold text-white">
            {facing.display}
            <span className="text-sm text-slate-500">/10</span>
          </p>
          <p className="text-[11px] leading-tight text-slate-400">{facing.label}</p>
        </div>
        {ca && (
          <div className="col-span-1 rounded-lg border border-night-600 bg-night-900/60 px-3 py-2 sm:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Who may pay first
            </p>
            <p className="mt-1 text-sm font-medium leading-snug text-white">
              {ca.primary_buyer}
            </p>
          </div>
        )}
      </div>
      {ca && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Paid offer
            </dt>
            <dd className="mt-0.5 text-slate-200">{ca.smallest_paid_offer}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Wedge
            </dt>
            <dd className="mt-0.5 capitalize text-slate-200">
              {ca.wedge_clarity}: {ca.honesty_note}
            </dd>
          </div>
        </dl>
      )}
      {analysis.big_promise && (
        <p className="border-l-2 border-rain pl-3 text-sm italic leading-snug text-slate-200">
          {analysis.big_promise}
        </p>
      )}
      <p className="text-sm text-slate-300">
        <span className="font-semibold text-white">Next: </span>
        {next}
      </p>
    </div>
  );
}

/** Compact Executive Brief for Buyer Stress Test. */
export function StressExecutiveBrief({
  result,
}: {
  result: BuyerStressTestResult;
}) {
  const survival = toFounderFacingSurvival(result.survival_score);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Verdict
          </p>
          <p className="text-xl font-bold capitalize text-white">
            {result.verdict}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Survival
          </p>
          <p className="text-xl font-bold text-white">
            {survival}
            <span className="text-sm text-slate-500">/10</span>
          </p>
        </div>
      </div>
      <p className="text-sm font-medium leading-snug text-white">
        {result.verdict_line}
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Who may pay
          </dt>
          <dd className="mt-0.5 text-slate-200">
            {result.offer_rewrite.who_may_pay}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Paid offer
          </dt>
          <dd className="mt-0.5 text-slate-200">
            {result.offer_rewrite.smallest_paid_offer}
          </dd>
        </div>
      </dl>
      {result.dm_opener_after_test && (
        <div className="rounded-lg border border-night-600 bg-night-900/50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Ready DM opener
          </p>
          <p className="mt-1 text-sm leading-snug text-slate-200">
            {result.dm_opener_after_test}
          </p>
        </div>
      )}
    </div>
  );
}

/** Compact Executive Brief for Pricing. */
export function PricingExecutiveBrief({
  pricing,
}: {
  pricing: import("@/types").PricingRecommendation;
}) {
  const sweet =
    pricing.price_ranges?.find((r) => r.model === pricing.recommended_model) ||
    pricing.price_ranges?.[0];
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-night-600 bg-night-900/60 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Model
          </p>
          <p className="mt-1 text-sm font-semibold capitalize text-white">
            {pricing.recommended_model.replace("_", " ")}
          </p>
        </div>
        {sweet && (
          <div className="rounded-lg border border-night-600 bg-night-900/60 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Sweet spot
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              ${sweet.sweet_spot}
              <span className="font-normal text-slate-400">
                {" "}
                ({sweet.label})
              </span>
            </p>
          </div>
        )}
      </div>
      {pricing.willingness_to_pay_logic && (
        <p className="text-sm text-slate-300">{pricing.willingness_to_pay_logic}</p>
      )}
      <p className="text-sm text-slate-300">
        <span className="font-semibold text-white">Next: </span>
        {pricing.pricing_experiment ||
          "Test the sweet spot on 5 real conversations this week."}
      </p>
    </div>
  );
}

/** Compact Executive Brief for Strategy / Site Optimize / Proof Pack memos. */
export function ToolMemoExecutiveBrief({
  memo,
}: {
  memo: { tool_label: string; headline: string; bullets: string[]; next_action?: string };
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {memo.tool_label}
      </p>
      <p className="text-sm font-medium leading-snug text-white">{memo.headline}</p>
      {memo.bullets?.length > 0 && (
        <ul className="space-y-1 text-sm text-slate-300">
          {memo.bullets.slice(0, 4).map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-aqua">·</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {memo.next_action && (
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">Next: </span>
          {memo.next_action}
        </p>
      )}
    </div>
  );
}
