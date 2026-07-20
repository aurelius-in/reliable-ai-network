"use client";

import { useState } from "react";
import { Check, Trophy } from "lucide-react";
import { ErrorText } from "@/components/ui";
import { MILESTONES } from "@/lib/milestones";
import { SUCCESS_STORIES } from "@/lib/success-wall";

/**
 * Tab 6 — Progress Tracker + Success Wall (Growth).
 * Milestone checklist persisted to progress_logs, "assets ready" stats
 * from generated_assets, and a read-only wall of curated wins.
 */
export function ProgressTab({
  initialProgress,
  assetStats,
}: {
  initialProgress: Record<string, boolean>;
  assetStats: { total: number; byLabel: { label: string; count: number }[] };
}) {
  const [progress, setProgress] =
    useState<Record<string, boolean>>(initialProgress);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doneCount = MILESTONES.filter((m) => progress[m.id]).length;
  const percent = Math.round((doneCount / MILESTONES.length) * 100);

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
      // Roll back the optimistic update.
      setProgress((prev) => ({ ...prev, [milestoneId]: !next }));
      setError(err instanceof Error ? err.message : "Could not save progress");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card-glow p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Assets ready
          </p>
          <p className="mt-1 text-4xl font-black gradient-text">
            {assetStats.total}
          </p>
          <p className="helper-text">
            Everything you&apos;ve generated — analyses, funnels, content, and
            more.
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Journey progress
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
              Nothing yet — run any tool and it lands here.
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

      {/* Milestones */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white">
          Your path to first revenue
        </h3>
        <p className="helper-text">
          Tap a step when you&apos;ve done it. Each one moves real money closer.
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

      {/* Success wall */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={18} className="text-violet-bright" />
          <h3 className="text-lg font-bold text-white">Success Wall</h3>
          <span className="rounded-full bg-night-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Community wins
          </span>
        </div>
        <p className="mb-4 text-sm text-slate-400">
          Real plays from creators like you. Steal what worked.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SUCCESS_STORIES.map((story) => (
            <div
              key={story.name}
              className="rounded-2xl border border-night-600 bg-night-700 p-5 transition hover:border-violet/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night-800 text-xl">
                  {story.emoji}
                </span>
                <div>
                  <p className="font-bold text-white">{story.name}</p>
                  <p className="text-xs text-slate-400">{story.product}</p>
                </div>
              </div>
              <p className="mt-3 font-bold gradient-text">{story.win}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                {story.detail}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {story.timeframe}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
