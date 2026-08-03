"use client";

import { useState } from "react";
import { FlaskConical, Loader2, Minus, Plus, Sparkles, TrendingUp } from "lucide-react";
import {
  ChipGroup,
  DownloadButton,
  ErrorText,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { OutputCaveat } from "@/components/OutputCaveat";
import type { Creation, MetricsAnalysis, MetricsEntry } from "@/types";

function analysisToMarkdown(
  analysis: MetricsAnalysis,
  entries: MetricsEntry[]
): string {
  const lines = [
    "# What's working — metrics analysis",
    "",
    "## Logged weeks",
    "",
    ...entries.map(
      (e) =>
        `- ${e.week_label}: visitors ${e.visitors}, signups ${e.signups}, sales ${e.sales}, revenue $${e.revenue}`
    ),
    "",
    "## What's working",
    "",
    ...analysis.whats_working.map(
      (w) => `- **${w.finding}** — ${w.evidence}`
    ),
    "",
    "## Bottleneck",
    "",
    `**${analysis.bottleneck.stage}**`,
    "",
    analysis.bottleneck.diagnosis,
    "",
    analysis.bottleneck.why_it_matters,
    "",
    "## Next tests",
    "",
    ...analysis.next_tests.map(
      (t) =>
        `- **${t.name}** (${t.difficulty}): ${t.action} — Expect: ${t.expected_result}`
    ),
    "",
    `> ${analysis.encouragement}`,
  ];
  return lines.join("\n");
}

const DEMO_ENTRIES: MetricsEntry[] = [
  { week_label: "Week 1", visitors: 120, signups: 9, sales: 1, revenue: 29, logged_at: "", demo: true },
  { week_label: "Week 2", visitors: 260, signups: 21, sales: 2, revenue: 58, logged_at: "", demo: true },
  { week_label: "Week 3", visitors: 480, signups: 44, sales: 5, revenue: 145, logged_at: "", demo: true },
  { week_label: "Week 4", visitors: 610, signups: 58, sales: 9, revenue: 261, logged_at: "", demo: true },
];

const METRIC_OPTIONS = [
  { value: "revenue", label: "💵 Revenue" },
  { value: "visitors", label: "👀 Visitors" },
  { value: "signups", label: "📝 Signups" },
  { value: "sales", label: "🛒 Sales" },
];

type MetricKey = "visitors" | "signups" | "sales" | "revenue";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-emerald-400",
  medium: "text-amber-300",
  hard: "text-red-400",
};

function Stepper({
  emoji,
  label,
  value,
  onChange,
  step,
  prefix,
}: {
  emoji: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  prefix?: string;
}) {
  return (
    <div className="rounded-xl border border-night-600 bg-night-800 p-3.5">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        {emoji} {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - step))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-night-600 bg-night-700 text-slate-300 transition hover:border-rain/50 hover:text-white"
        >
          <Minus size={14} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
          {prefix && <span className="text-sm font-bold text-slate-400">{prefix}</span>}
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-full min-w-0 bg-transparent text-center text-lg font-black text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label={label}
          />
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-night-600 bg-night-700 text-slate-300 transition hover:border-rain/50 hover:text-white"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function TrendChart({
  entries,
  metric,
}: {
  entries: MetricsEntry[];
  metric: MetricKey;
}) {
  const width = 640;
  const height = 180;
  const pad = { top: 16, bottom: 30, left: 8, right: 8 };
  const values = entries.map((e) => e[metric]);
  const max = Math.max(...values, 1);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const barGap = 14;
  const barW = Math.min(64, innerW / entries.length - barGap);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`${metric} by week`}
    >
      <defs>
        <linearGradient id="rain-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4d9e" />
          <stop offset="100%" stopColor="#e20074" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + innerH * (1 - f)}
          y2={pad.top + innerH * (1 - f)}
          stroke="#27272f"
          strokeDasharray="3 5"
        />
      ))}
      {entries.map((entry, i) => {
        const slotW = innerW / entries.length;
        const x = pad.left + slotW * i + (slotW - barW) / 2;
        const h = Math.max(3, (entry[metric] / max) * innerH);
        const y = pad.top + innerH - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={6} fill="url(#rain-bar)" />
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-white"
              fontSize="12"
              fontWeight="800"
            >
              {metric === "revenue" ? `$${entry[metric]}` : entry[metric]}
            </text>
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              fill="#8f8a99"
              fontSize="11"
            >
              {entry.week_label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Tab — What's Working (Pro).
 * Log simple weekly numbers with steppers, see a lightweight SVG trend
 * chart, then let the AI optimizer find the bottleneck and next tests.
 */
export function ResultsTab({
  creations,
  initialEntries,
  initialAnalysis,
  onJumpTab,
}: {
  creations: Creation[];
  initialEntries: MetricsEntry[];
  initialAnalysis: MetricsAnalysis | null;
  onJumpTab?: (tabId: string) => void;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [entries, setEntries] = useState<MetricsEntry[]>(initialEntries);
  const [visitors, setVisitors] = useState(0);
  const [signups, setSignups] = useState(0);
  const [sales, setSales] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [metric, setMetric] = useState<string>("revenue");
  const [analysis, setAnalysis] = useState<MetricsAnalysis | null>(initialAnalysis);
  const [logging, setLogging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDemo = entries.length > 0 && entries.every((e) => e.demo);
  const latest = entries[entries.length - 1];

  async function logWeek() {
    setLogging(true);
    setError(null);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log",
          visitors,
          signups,
          sales,
          revenue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your numbers");
      // Replace demo rows with the user's first real entry.
      setEntries((prev) => [...prev.filter((e) => !e.demo), data.entry]);
      setVisitors(0);
      setSignups(0);
      setSales(0);
      setRevenue(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLogging(false);
    }
  }

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          // Demo entries only exist client-side, so send them along.
          ...(isDemo ? { entries } : {}),
          ...(choice?.creationId
            ? { creationId: choice.creationId }
            : choice
              ? {
                  title: choice.title,
                  description: choice.description,
                  type: choice.type,
                }
              : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Quick entry */}
      <div className="card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            What&apos;s working? Let the numbers talk
          </h2>
          <p className="helper-text">
            Once a week, jot down four numbers. We&apos;ll chart your trend
            and tell you exactly what to fix next. Rough guesses are fine —
            done beats perfect.
          </p>
        </div>

        {creations.length > 0 && (
          <ProductPicker
            creations={creations}
            value={choice}
            onChange={setChoice}
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stepper emoji="👀" label="Visitors" value={visitors} onChange={setVisitors} step={10} />
          <Stepper emoji="📝" label="Signups" value={signups} onChange={setSignups} step={5} />
          <Stepper emoji="🛒" label="Sales" value={sales} onChange={setSales} step={1} />
          <Stepper emoji="💵" label="Revenue" value={revenue} onChange={setRevenue} step={10} prefix="$" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={logWeek} disabled={logging} className="btn-primary">
            {logging ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <TrendingUp size={16} />
            )}
            Log this week
          </button>
          {entries.length === 0 && (
            <button
              type="button"
              onClick={() => setEntries(DEMO_ENTRIES)}
              className="btn-secondary"
            >
              ✨ Show me with demo data
            </button>
          )}
        </div>
        <ErrorText message={error} />
      </div>

      {/* Trend + this week's funnel */}
      {entries.length > 0 && (
        <div className="card fade-up p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              📊 Your trend{" "}
              {isDemo && (
                <span className="ml-1 rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet-bright ring-1 ring-violet/40">
                  Demo data
                </span>
              )}
            </h4>
            <ChipGroup
              options={METRIC_OPTIONS}
              value={metric}
              onChange={setMetric}
              ariaLabel="Chart metric"
            />
          </div>
          <div className="mt-4">
            <TrendChart entries={entries.slice(-8)} metric={metric as MetricKey} />
          </div>

          {latest && latest.visitors > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-night-800 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Visitors → signups ({latest.week_label})
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {((latest.signups / latest.visitors) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-xl bg-night-800 p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Signups → sales ({latest.week_label})
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {latest.signups > 0
                    ? `${((latest.sales / latest.signups) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={analyze}
            disabled={analyzing}
            className="btn-primary mt-5"
          >
            {analyzing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {analysis ? "Re-analyze my numbers" : "What should I fix next?"}
          </button>
        </div>
      )}

      {analyzing && <FunLoading headline="Reading your numbers like a pro…" />}

      {!analyzing && analysis && (
        <AnalysisResultView
          analysis={analysis}
          entries={entries}
          onJumpTab={onJumpTab}
        />
      )}

      {entries.length === 0 && (
        <TeachingEmptyState
          emoji="📈"
          title="Your results dashboard appears here"
          body="Log this week's visitors, signups, sales, and revenue — or tap the demo data button — and the AI will spot your bottleneck and hand you next week's fixes."
        />
      )}
    </div>
  );
}

function AnalysisResultView({
  analysis,
  entries,
  onJumpTab,
}: {
  analysis: MetricsAnalysis;
  entries: MetricsEntry[];
  onJumpTab?: (tabId: string) => void;
}) {
  const stage = analysis.bottleneck.stage.toLowerCase();
  const jumpTab =
    stage.includes("traffic") || stage.includes("visitor") || stage.includes("aware")
      ? "traffic"
      : stage.includes("sales") || stage.includes("close") || stage.includes("outreach")
        ? "sales"
        : stage.includes("signup") || stage.includes("convert") || stage.includes("funnel")
          ? "funnel"
          : "content";

  return (
    <div className="fade-up space-y-4">
      <OutputCaveat tool="results" />
      <div className="flex justify-end">
        <DownloadButton
          filename="metrics-analysis.md"
          content={analysisToMarkdown(analysis, entries)}
          label="Download analysis"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
            ✅ What&apos;s working
          </h4>
          <div className="mt-3 space-y-3">
            {analysis.whats_working.map((item, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold text-slate-200">{item.finding}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            🚧 Your bottleneck
          </h4>
          <p className="mt-2 text-lg font-black text-white">
            {analysis.bottleneck.stage}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
            {analysis.bottleneck.diagnosis}
          </p>
          <p className="mt-3 rounded-lg bg-rain/10 p-3 text-sm font-semibold text-pink">
            💰 {analysis.bottleneck.why_it_matters}
          </p>
          {onJumpTab && (
            <button
              type="button"
              onClick={() => onJumpTab(jumpTab)}
              className="btn-secondary mt-4 inline-flex items-center gap-2 !px-3 !py-2 text-xs"
            >
              Fix in {jumpTab}
            </button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
          <FlaskConical size={15} /> Try this next week
        </h4>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {analysis.next_tests.map((test, i) => (
            <div key={i} className="rounded-xl border border-night-600 bg-night-800 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-white">{test.name}</p>
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${DIFFICULTY_COLORS[test.difficulty] ?? "text-slate-300"}`}
                >
                  {test.difficulty}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {test.action}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Expect: {test.expected_result}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-400">
          💪 {analysis.encouragement}
        </p>
      </div>
    </div>
  );
}
