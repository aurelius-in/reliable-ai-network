import { CheckCircle2, Target, TrendingUp } from "lucide-react";
import type { IdeaAnalysis } from "@/types";

const LEVEL_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-gold",
  high: "text-red-400",
};

const POTENTIAL_COLORS: Record<string, string> = {
  low: "text-slate-400",
  medium: "text-electric-bright",
  high: "text-gold",
};

export function AnalysisResult({ analysis }: { analysis: IdeaAnalysis }) {
  const score = Math.max(1, Math.min(10, Math.round(analysis.score)));

  return (
    <div className="fade-up space-y-6">
      {/* Score */}
      <div className="glow-card flex flex-wrap items-center gap-6 rounded-2xl border border-electric/30 bg-night-700 p-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-night-800 ring-4 ring-electric/40">
          <span className="text-4xl font-black gradient-text">{score}</span>
          <span className="absolute -bottom-1 rounded-full bg-night-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            / 10
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white">Monetization Score</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {analysis.score_reasoning}
          </p>
        </div>
      </div>

      {/* Big promise */}
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-night-700 p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gold">
          <Target size={16} /> Your Big Promise
        </h3>
        <p className="mt-3 text-xl font-semibold leading-snug text-white">
          &ldquo;{analysis.big_promise}&rdquo;
        </p>
      </div>

      {/* Paths */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-electric-bright">
          <TrendingUp size={16} /> Recommended Monetization Paths
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.recommended_paths?.map((path, i) => (
            <div
              key={i}
              className="rounded-xl border border-night-600 bg-night-700 p-4 transition hover:border-electric/50"
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
      <div className="rounded-2xl border border-night-600 bg-night-700 p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
          Quick Wins This Week
        </h3>
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
