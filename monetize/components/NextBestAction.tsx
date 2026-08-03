"use client";

/**
 * Quiet “still open” strip — points at unfinished slices without competing
 * with the linear Next step control.
 */

import { ArrowRight, Lock } from "lucide-react";
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
      className={`rounded-xl border px-3.5 py-3 sm:px-4 ${
        pieComplete
          ? "border-aqua/25 bg-aqua/5"
          : action.locked
            ? "border-night-600 bg-night-800/80"
            : "border-night-600 bg-night-800/80"
      }`}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {pieComplete ? "Pie complete" : "Still open"}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-200">
            {pieComplete
              ? "You finished every slice"
              : action.locked
                ? `Locked: ${action.step.label}`
                : action.step.label}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-slate-500">
            {pieComplete
              ? action.reason
              : action.locked
                ? action.reason
                : `${remaining} unfinished · jump here if you skipped ahead`}
          </p>
        </div>
        <button
          type="button"
          onClick={onGo}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-night-600 bg-night-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-aqua/40 hover:text-white sm:self-center"
        >
          {action.locked ? (
            <>
              <Lock size={13} />
              Upgrade
            </>
          ) : pieComplete ? (
            <>
              Open {action.step.short}
              <ArrowRight size={13} />
            </>
          ) : (
            <>
              Jump to slice
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
