import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { track } from "@/lib/track";
import type { IdeaAnalysis } from "@/types";
import {
  buildFirstRunItems,
  markFirstRunComplete,
  type FirstRunItem,
} from "@/lib/first-run";

/**
 * First-run success: founder leaves with a commercial investigation start,
 * not "I generated an analysis." Primary conversion lever after signup.
 */
export function FirstRunSuccess({
  analysis,
  nextHref = "/dashboard?tab=buyers",
  source = "analyzer",
  compact = false,
  showPaidNext = false,
}: {
  analysis: IdeaAnalysis;
  nextHref?: string;
  source?: "onboarding" | "analyzer";
  compact?: boolean;
  showPaidNext?: boolean;
}) {
  const items = buildFirstRunItems(analysis);

  function onContinue() {
    markFirstRunComplete();
    track("first_run_complete", {
      source,
      has_commercial_answer: Boolean(analysis.commercial_answer),
      wedge: analysis.commercial_answer?.wedge_clarity ?? "unknown",
    });
    track("ui_click", { target: "first_run_demand_radar", source });
  }

  return (
    <div
      className={`rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 via-night-800 to-night-800 ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rain-bright">
        First run complete
      </p>
      <h3
        className={`mt-1.5 font-black text-white ${
          compact ? "text-lg" : "text-xl sm:text-2xl"
        }`}
      >
        You have a commercial test to run
      </h3>
      <p className="mt-1.5 text-sm text-slate-300">
        Not another AI opinion. Four things to act on, then people you already
        know.
      </p>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <FirstRunRow key={item.id} item={item} />
        ))}
      </ul>

      <Link
        href={nextHref}
        onClick={onContinue}
        className={`inline-flex w-full items-center justify-center gap-2 text-sm font-semibold sm:w-auto ${
          showPaidNext
            ? "mt-4 text-slate-300 hover:text-white"
            : "btn-primary mt-5 !py-3.5 text-base sm:!px-8"
        }`}
      >
        {showPaidNext
          ? "Continue with Daily Market Research"
          : "Next: Daily Market Research"}{" "}
        <ArrowRight size={18} />
      </Link>
      <p className="mt-2 text-xs text-slate-500">
        Free tools stay. Step 1: people you already know. Step 2: scan public
        communities. Approve every outreach before sending.
      </p>
    </div>
  );
}

function FirstRunRow({ item }: { item: FirstRunItem }) {
  return (
    <li className="flex gap-3 rounded-xl border border-white/10 bg-night-900/50 px-3 py-2.5">
      <CheckCircle2
        size={18}
        className="mt-0.5 shrink-0 text-emerald-400"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {item.label}
        </p>
        <p className="mt-0.5 text-sm leading-snug text-white">{item.value}</p>
      </div>
    </li>
  );
}
