"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { ErrorText } from "@/components/ui";
import { FirstDollarPath, type FirstDollarSteps } from "@/components/FirstDollarPath";
import { MILESTONES } from "@/lib/milestones";
import { JOURNEY_STEPS } from "@/lib/journey";
import type {
  FunnelPlan,
  IdeaAnalysis,
  RevenueStreamsPlan,
} from "@/types";

const TAB_LABELS: Record<string, string> = Object.fromEntries(
  JOURNEY_STEPS.map((s) => [s.id, s.label])
);

function deriveFirstDollar(args: {
  revenue?: RevenueStreamsPlan | null;
  funnel?: FunnelPlan | null;
  analyses?: Record<string, IdeaAnalysis>;
}): FirstDollarSteps | null {
  if (args.revenue?.first_dollar_path) {
    return args.revenue.first_dollar_path;
  }
  if (args.funnel?.first_dollar_offer) {
    return {
      offer: args.funnel.first_dollar_offer.name,
      price: args.funnel.first_dollar_offer.price,
      who: "Primary buyer for this funnel",
      channel: "Landing page + outreach",
      ask: args.funnel.first_dollar_offer.ask,
      pay_how: "Checkout / invoice linked from CTA",
      this_week: args.funnel.next_steps?.slice(0, 5) ?? [
        "Publish the tripwire page",
        "Send 10 outreach messages with the ask",
        "Log replies in Results",
      ],
    };
  }
  const analysis = Object.values(args.analyses ?? {})[0];
  if (analysis) {
    return {
      offer: analysis.big_promise || "Your first paid offer",
      price: "Test price from Pricing Builder",
      who: "Best-first buyer from Find Your Buyers",
      channel: "Direct outreach this week",
      ask: `Would you pay for help getting ${analysis.big_promise}?`,
      pay_how: "Invoice or checkout link in the same thread",
      this_week: analysis.validation_plan?.slice(0, 5) ??
        analysis.quick_wins?.slice(0, 5) ?? [
          "Run Pricing Builder",
          "Run Find Your Buyers",
          "Send 10 asks from DM Writer",
        ],
    };
  }
  return null;
}

/**
 * Momentum & next move — checklist + first-dollar hub + auto next action.
 */
export function ProgressTab({
  initialProgress,
  assetStats,
  onJumpTab,
  initialRevenue = null,
  initialFunnel = null,
  initialAnalyses = {},
}: {
  initialProgress: Record<string, boolean>;
  assetStats: { total: number; byLabel: { label: string; count: number }[] };
  onJumpTab?: (tabId: string) => void;
  initialRevenue?: RevenueStreamsPlan | null;
  initialFunnel?: FunnelPlan | null;
  initialAnalyses?: Record<string, IdeaAnalysis>;
}) {
  const [progress, setProgress] =
    useState<Record<string, boolean>>(initialProgress);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doneCount = MILESTONES.filter((m) => progress[m.id]).length;
  const percent = Math.round((doneCount / MILESTONES.length) * 100);

  const firstDollar = useMemo(
    () =>
      deriveFirstDollar({
        revenue: initialRevenue,
        funnel: initialFunnel,
        analyses: initialAnalyses,
      }),
    [initialRevenue, initialFunnel, initialAnalyses]
  );

  const suggested = useMemo(() => {
    const labels = assetStats.byLabel.map((e) => e.label.toLowerCase());
    const has = (needle: string) =>
      labels.some((l) => l.includes(needle)) || assetStats.total > 0;

    for (const m of MILESTONES) {
      if (progress[m.id]) continue;
      if (m.id === "analyzed_idea") {
        return {
          milestone: m,
          tab: "analyzer",
          reason:
            "You have not locked a hard commercial answer yet. Start with Analyzer.",
        };
      }
      if (m.id === "built_pricing" && (has("idea") || has("analy"))) {
        return {
          milestone: m,
          tab: "pricing",
          reason:
            "You have an analysis. Lock a defensible price and a test next.",
        };
      }
      if (m.id === "named_buyers" && (has("idea") || has("analy"))) {
        return {
          milestone: m,
          tab: "buyers",
          reason:
            "Run Demand Radar for ranked signals before inventing more copy.",
        };
      }
      if (m.id === "built_funnel" && (has("pricing") || progress.built_pricing)) {
        return {
          milestone: m,
          tab: "funnel",
          reason: "Price without a path to paid leaves money on the table.",
        };
      }
      if (
        m.id === "created_content" &&
        (has("funnel") || progress.built_funnel)
      ) {
        return {
          milestone: m,
          tab: "content",
          reason: "Turn the offer into posts and emails people can act on.",
        };
      }
      if (m.id === "first_outreach") {
        return {
          milestone: m,
          tab: "sales",
          reason:
            "Start a First Customer Sprint: act on the strongest Demand Radar signals.",
        };
      }
      return {
        milestone: m,
        tab:
          m.id === "first_dollar" || m.id === "first_100" ? "results" : "launch",
        reason: m.helper,
      };
    }
    return null;
  }, [progress, assetStats]);

  async function toggle(milestoneId: string) {
    const next = !progress[milestoneId];
    setSavingId(milestoneId);
    setError(null);
    setProgress((prev) => ({ ...prev, [milestoneId]: next }));
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestone: milestoneId, completed: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save");
      }
    } catch (err) {
      setProgress((prev) => ({ ...prev, [milestoneId]: !next }));
      setError(err instanceof Error ? err.message : "Could not save progress");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-lg font-bold text-white">Momentum &amp; next move</h2>
        <p className="helper-text">
          First-customer path: hard answer → Demand Radar → sprint → Results.
          Next move is suggested from what you already generated.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card-glow p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Assets ready
          </p>
          <p className="mt-1 text-4xl font-black gradient-text">
            {assetStats.total}
          </p>
          <p className="helper-text">
            Analyses, pricing, funnels, content, and kits you have generated.
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Path progress
          </p>
          <p className="mt-1 text-4xl font-black text-white">{percent}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-night-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rain to-violet transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            What you&apos;ve made
          </p>
          {assetStats.byLabel.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              Nothing yet. Run Analyzer for your hard commercial answer, then
              run Demand Radar.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {assetStats.byLabel.slice(0, 4).map((entry) => (
                <li key={entry.label} className="flex justify-between">
                  <span>{entry.label}</span>
                  <span className="font-bold text-white">{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {firstDollar && (
        <FirstDollarPath steps={firstDollar} onJump={onJumpTab} />
      )}

      {suggested && (
        <div className="rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/10 to-night-800 p-5">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-rain-bright">
            <Sparkles size={14} /> Next money move
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            {suggested.milestone.emoji} {suggested.milestone.label}
          </p>
          <p className="mt-1 text-sm text-slate-300">{suggested.reason}</p>
          {onJumpTab && (
            <button
              type="button"
              onClick={() => onJumpTab(suggested.tab)}
              className="btn-primary mt-4 inline-flex items-center gap-2 !px-4 !py-2.5 text-sm"
            >
              Open {TAB_LABELS[suggested.tab] ?? suggested.tab}{" "}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      <div className="card p-6">
        <h3 className="text-lg font-bold text-white">
          Your path to first revenue
        </h3>
        <p className="helper-text">
          Tap a step when you have done it. Each one moves a paid yes closer.
        </p>
        <ErrorText message={error} />
        <div className="mt-4 space-y-2">
          {MILESTONES.map((milestone) => {
            const done = !!progress[milestone.id];
            return (
              <button
                key={milestone.id}
                onClick={() => toggle(milestone.id)}
                disabled={savingId === milestone.id}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition active:scale-[0.98] ${
                  done
                    ? "border-emerald-500/40 bg-emerald-500/8"
                    : "border-night-600 bg-night-800 hover:border-rain/40"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    done
                      ? "border-emerald-400 bg-emerald-400 text-night"
                      : "border-night-600 text-transparent"
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block font-semibold ${done ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-white"}`}
                  >
                    {milestone.emoji} {milestone.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                    {milestone.helper}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
