"use client";

/**
 * Animated next-best-action strip — one clear move, not a wall of tools.
 */

import { ArrowRight, Lock, Sparkles } from "lucide-react";
import type { NextBestAction } from "@/lib/journey";
import { countCompleted, JOURNEY_STEPS } from "@/lib/journey";
import type { JourneyTabId } from "@/lib/journey";

export function NextBestActionCard({
  action,
  completion,
  onGo,
  pieComplete,
}: {
  action: NextBestAction;
  completion: Record<JourneyTabId, boolean>;
  onGo: () => void;
  pieComplete: boolean;
}) {
  const done = countCompleted(completion);
  const remaining = JOURNEY_STEPS.length - done;

  return (
    <div
      className={`nba-card relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${
        pieComplete
          ? "border-aqua/40 bg-aqua/10"
          : action.locked
            ? "border-violet/40 bg-violet/10"
            : "border-rain/40 bg-gradient-to-r from-aqua/10 via-violet/10 to-rain/10"
      }`}
    >
      <div className="nba-shimmer pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-aqua-bright">
            <Sparkles size={12} className="nba-spark" />
            {pieComplete ? "Pie complete" : "Next best action"}
          </p>
          <p className="mt-1.5 text-lg font-bold text-white sm:text-xl">
            {pieComplete
              ? "You ate the whole pie"
              : action.locked
                ? `Unlock ${action.step.label}`
                : action.step.label}
          </p>
          <p className="mt-1 text-sm text-slate-300">{action.reason}</p>
          {!pieComplete && (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {remaining} slice{remaining === 1 ? "" : "s"} left · stay on the
              path
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onGo}
          className="nba-cta group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aqua via-violet to-rain px-5 py-3 text-sm font-bold text-white shadow-lg shadow-aqua/20 transition hover:brightness-110 active:scale-[0.98]"
        >
          {action.locked ? (
            <>
              <Lock size={16} />
              See upgrade
            </>
          ) : pieComplete ? (
            <>
              Open {action.step.short}
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight
                size={16}
                className="nba-arrow transition group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
