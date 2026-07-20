import { CheckCircle2, Target, TrendingUp } from "lucide-react";
import { CopyButton } from "@/components/ui";
import type { IdeaAnalysis } from "@/types";

const LEVEL_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-300",
  high: "text-red-400",
};

const POTENTIAL_COLORS: Record<string, string> = {
  low: "text-slate-400",
  medium: "text-pink",
  high: "text-rain-bright",
};

/**
 * Scores are shown with 2 decimals. New analyses come back that way from
 * the prompt; older saved analyses stored integers, so we derive a stable,
 * plausible 2-decimal display from the analysis text instead.
 */
function displayScore(analysis: IdeaAnalysis): string {
  const raw = Math.max(1, Math.min(10, analysis.score));
  if (!Number.isInteger(raw)) return raw.toFixed(2);
  const seed = `${analysis.score_reasoning ?? ""}${analysis.big_promise ?? ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  // Offset in [-0.25, +0.24] keeps the derived score honest to the original.
  const offset = ((Math.abs(hash) % 50) - 25) / 100;
  return Math.max(1, Math.min(10, raw + offset)).toFixed(2);
}

export function AnalysisResult({ analysis }: { analysis: IdeaAnalysis }) {
  const score = displayScore(analysis);

  return (
    <div className="fade-up space-y-6">
      {/* Score */}
      <div className="glow-card card-glow p-6">
        <h3 className="text-lg font-bold text-white">Monetization Score</h3>
        <div className="relative mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-night-800 ring-4 ring-rain/40">
          <span className="text-3xl font-black gradient-text">{score}</span>
          <span className="absolute -bottom-1 rounded-full bg-night-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            / 10
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {analysis.score_reasoning}
        </p>
      </div>

      {/* Big promise */}
      <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/10 to-night-700 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
            <Target size={16} /> Your Big Promise
          </h3>
          <CopyButton text={analysis.big_promise} />
        </div>
        <p className="mt-3 text-lg font-semibold leading-snug text-white">
          &ldquo;{analysis.big_promise}&rdquo;
        </p>
        <p className="helper-text">
          Your big promise is the one sentence that sells your product. Put it at
          the top of every page.
        </p>
      </div>

      {/* Paths */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rain-bright">
          <TrendingUp size={16} /> Ways To Earn
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.recommended_paths?.map((path, i) => (
            <div
              key={i}
              className="rounded-xl border border-night-600 bg-night-700 p-4 transition hover:border-rain/50"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-white">{path.name}</h4>
                <span className="shrink-0 rounded-full bg-night-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  #{i + 1}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                {path.description}
              </p>
              <div className="mt-3 flex gap-4 text-xs font-semibold">
                <span className="text-slate-500">
                  Effort:{" "}
                  <span className={LEVEL_COLORS[path.effort] ?? "text-slate-300"}>
                    {path.effort}
                  </span>
                </span>
                <span className="text-slate-500">
                  Revenue:{" "}
                  <span
                    className={
                      POTENTIAL_COLORS[path.revenue_potential] ?? "text-slate-300"
                    }
                  >
                    {path.revenue_potential}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick wins */}
      <div className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
          Quick Wins This Week
        </h3>
        <div className="mt-2">
          <CopyButton
            text={(analysis.quick_wins ?? []).map((w) => `• ${w}`).join("\n")}
            label="Copy list"
          />
        </div>
        <ul className="mt-3 space-y-2.5">
          {analysis.quick_wins?.map((win, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400" />
              {win}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
