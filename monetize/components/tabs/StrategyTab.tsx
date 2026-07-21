"use client";

import { useState } from "react";
import { Brain, Building2, ExternalLink, Loader2 } from "lucide-react";
import {
  CopyButton,
  ErrorText,
  FieldLabel,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import type {
  AbTestPlan,
  CompetitorAnalysis,
  Creation,
  PricingOptimization,
  RoadmapPlan,
  StrategyResults,
  StrategyToolId,
} from "@/types";

type ApolloCompanyRow = {
  name: string;
  domain: string | null;
  industry: string | null;
  employeeCount: number | null;
  revenue: string | null;
  foundedYear: number | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  keywords: string[] | null;
};

type CompetitorEnrichResult = {
  inputName: string;
  company: ApolloCompanyRow | null;
};

const STRATEGY_TOOLS: {
  id: StrategyToolId;
  emoji: string;
  label: string;
  helper: string;
}[] = [
  {
    id: "competitors",
    emoji: "🔍",
    label: "Competitor scan",
    helper: "Who you're up against, their prices, and your edge.",
  },
  {
    id: "pricing_optimization",
    emoji: "📈",
    label: "Pricing optimizer",
    helper: "The money you're leaving on the table, and how to get it.",
  },
  {
    id: "roadmap",
    emoji: "🗺️",
    label: "30/60/90 roadmap",
    helper: "A custom day-by-day plan for your next 3 months.",
  },
  {
    id: "ab_tests",
    emoji: "🧪",
    label: "A/B test ideas",
    helper: "Simple experiments that grow revenue, easiest first.",
  },
];

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  easy: "text-emerald-400",
  medium: "text-amber-300",
  high: "text-red-400",
  hard: "text-red-400",
};

/**
 * Tab 7 — Advanced Strategy Tools (Pro).
 * Four AI analyses: competitor scan, pricing optimization,
 * 30/60/90-day roadmap, and A/B test suggestions.
 */
export function StrategyTab({
  creations,
  initialResults,
}: {
  creations: Creation[];
  initialResults: StrategyResults;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [tool, setTool] = useState<StrategyToolId>("competitors");
  const [results, setResults] = useState<StrategyResults>(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMeta = STRATEGY_TOOLS.find((t) => t.id === tool)!;
  const activeResult = results[tool];

  async function run() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          ...(choice.creationId
            ? { creationId: choice.creationId }
            : {
                title: choice.title,
                description: choice.description,
                type: choice.type,
              }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Strategy generation failed");
      setResults((prev) => ({ ...prev, [tool]: data.result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            Think like a strategist
          </h2>
          <p className="helper-text">
            The analysis a $500/hr consultant would do — done for your product
            in seconds.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div>
          <FieldLabel helper={activeMeta.helper}>Pick an analysis</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {STRATEGY_TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                className={`chip ${tool === t.id ? "chip-on" : ""}`}
              >
                {t.emoji} {t.label}
                {results[t.id] && <span className="text-emerald-400">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <button onClick={run} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Brain size={16} />
          )}
          {activeResult ? `Re-run ${activeMeta.label}` : `Run ${activeMeta.label}`}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline={`Running the ${activeMeta.label}…`} />}

      {!loading && tool === "competitors" && results.competitors && (
        <CompetitorsResult result={results.competitors} />
      )}
      {!loading &&
        tool === "pricing_optimization" &&
        results.pricing_optimization && (
          <PricingOptResult result={results.pricing_optimization} />
        )}
      {!loading && tool === "roadmap" && results.roadmap && (
        <RoadmapResult result={results.roadmap} />
      )}
      {!loading && tool === "ab_tests" && results.ab_tests && (
        <AbTestsResult result={results.ab_tests} />
      )}

      {!loading && !activeResult && (
        <TeachingEmptyState
          emoji={activeMeta.emoji}
          title={`Your ${activeMeta.label} appears here`}
          body={`${activeMeta.helper} Pick a product above and hit Run.`}
        />
      )}
    </div>
  );
}

function CompetitorsResult({ result }: { result: CompetitorAnalysis }) {
  const [enrichment, setEnrichment] = useState<CompetitorEnrichResult[] | null>(
    null
  );
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  async function enrichCompetitors() {
    setEnriching(true);
    setEnrichError(null);
    try {
      const res = await fetch("/api/strategy/competitors/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitors: (result.competitors ?? []).map((c) => ({
            name: c.name,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enrich failed");
      setEnrichment(data.results ?? []);
    } catch (err) {
      setEnrichError(
        err instanceof Error ? err.message : "Company enrich failed"
      );
    } finally {
      setEnriching(false);
    }
  }

  const enrichByName = new Map(
    (enrichment ?? []).map((row) => [row.inputName.toLowerCase(), row.company])
  );

  return (
    <div className="fade-up space-y-4">
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
              🔍 Market snapshot
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              {result.market_summary}
            </p>
          </div>
          <button
            type="button"
            onClick={enrichCompetitors}
            disabled={enriching}
            className="btn-secondary inline-flex shrink-0 items-center gap-2"
          >
            {enriching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Building2 size={14} />
            )}
            {enrichment ? "Refresh Apollo data" : "Enrich with Apollo"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Pulls firmographics (size, industry, LinkedIn) for each competitor
          name.
        </p>
        <ErrorText message={enrichError} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {result.competitors?.map((competitor, i) => {
          const company = enrichByName.get(competitor.name.toLowerCase());
          const location = company
            ? [company.city, company.state, company.country]
                .filter(Boolean)
                .join(", ")
            : "";
          return (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-white">{competitor.name}</h4>
                <span className="rounded-full bg-night-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
                  {competitor.pricing}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-400">
                {competitor.description}
              </p>
              {enrichment && (
                <div className="mt-3 rounded-lg border border-aqua/20 bg-aqua/5 p-3 text-xs text-slate-300">
                  {company ? (
                    <>
                      <p className="font-bold text-aqua">
                        Apollo
                        {company.domain ? ` · ${company.domain}` : ""}
                      </p>
                      <p className="mt-1">
                        {[
                          company.industry,
                          company.employeeCount != null
                            ? `~${company.employeeCount.toLocaleString()} employees`
                            : null,
                          company.foundedYear
                            ? `Founded ${company.foundedYear}`
                            : null,
                          company.revenue ? `Rev ${company.revenue}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Matched, limited public fields"}
                      </p>
                      {location && (
                        <p className="mt-0.5 text-slate-500">{location}</p>
                      )}
                      {company.keywords && company.keywords.length > 0 && (
                        <p className="mt-1 text-slate-500">
                          Keywords: {company.keywords.join(", ")}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {company.linkedinUrl && (
                          <a
                            href={company.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-aqua hover:underline"
                          >
                            LinkedIn <ExternalLink size={11} />
                          </a>
                        )}
                        {company.websiteUrl && (
                          <a
                            href={
                              company.websiteUrl.startsWith("http")
                                ? company.websiteUrl
                                : `https://${company.websiteUrl}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-aqua hover:underline"
                          >
                            Website <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500">
                      No Apollo company match for this name.
                    </p>
                  )}
                </div>
              )}
              <div className="mt-3 space-y-1.5 text-sm">
                <p className="text-slate-300">
                  <span className="font-semibold text-emerald-400">Strong:</span>{" "}
                  {competitor.strength}
                </p>
                <p className="text-slate-300">
                  <span className="font-semibold text-red-400">Weak:</span>{" "}
                  {competitor.weakness}
                </p>
              </div>
              <p className="mt-3 rounded-lg bg-rain/10 p-3 text-sm leading-relaxed text-pink">
                <span className="font-bold">Your edge:</span>{" "}
                {competitor.your_edge}
              </p>
            </div>
          );
        })}
      </div>
      <div className="card p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-violet-bright">
          Positioning moves
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {result.positioning_moves?.map((move, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-violet-bright">-</span> {move}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PricingOptResult({ result }: { result: PricingOptimization }) {
  return (
    <div className="fade-up space-y-4">
      <div className="card-glow p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          📈 Diagnosis
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {result.diagnosis}
        </p>
        <div className="mt-4 rounded-xl border border-rain/40 bg-rain/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-pink">
            Do this first
          </p>
          <p className="mt-1 font-semibold text-white">
            {result.recommended_move}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {result.experiments?.map((experiment, i) => (
          <div key={i} className="card p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Experiment {i + 1}
            </p>
            <h4 className="mt-1 font-bold text-white">{experiment.name}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {experiment.change}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Expect:</span>{" "}
              {experiment.expected_impact}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Risk:{" "}
              <span className={RISK_COLORS[experiment.risk] ?? "text-slate-300"}>
                {experiment.risk}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapResult({ result }: { result: RoadmapPlan }) {
  return (
    <div className="fade-up space-y-4">
      <div className="card-glow p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
          🗺️ North star
        </h3>
        <p className="mt-2 text-lg font-bold text-white">{result.north_star}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {result.phases?.map((phase, i) => (
          <div key={i} className="card p-5">
            <span className="rounded-full bg-violet/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-violet-bright">
              {phase.period}
            </span>
            <h4 className="mt-3 font-bold text-white">{phase.theme}</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              {phase.goals?.map((goal, gi) => (
                <li key={gi}>🎯 {goal}</li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 border-t border-night-600 pt-3">
              {phase.actions?.map((action, ai) => (
                <div key={ai} className="text-sm">
                  <p className="font-semibold text-slate-200">{action.task}</p>
                  <p className="text-xs text-slate-500">{action.why}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-night-800 p-2.5 text-xs text-slate-300">
              📏 <span className="font-semibold">Success looks like:</span>{" "}
              {phase.success_metric}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbTestsResult({ result }: { result: AbTestPlan }) {
  return (
    <div className="fade-up space-y-4">
      <div className="space-y-3">
        {result.tests?.map((test, i) => (
          <div key={i} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-white">
                🧪 {test.name}
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${RISK_COLORS[test.difficulty] ?? "text-slate-300"}`}
                >
                  {test.difficulty}
                </span>
                <CopyButton
                  text={`${test.name}\nHypothesis: ${test.hypothesis}\nA: ${test.variant_a}\nB: ${test.variant_b}\nMetric: ${test.metric}\nDuration: ${test.duration}`}
                />
              </div>
            </div>
            <p className="mt-1.5 text-sm italic text-slate-400">
              {test.hypothesis}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-night-600 bg-night-800 p-3 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  A — Control
                </p>
                <p className="mt-1 text-slate-300">{test.variant_a}</p>
              </div>
              <div className="rounded-lg border border-rain/40 bg-rain/8 p-3 text-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-pink">
                  B — Challenger
                </p>
                <p className="mt-1 text-slate-200">{test.variant_b}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              📊 Winner decided by{" "}
              <span className="font-semibold text-slate-200">{test.metric}</span>{" "}
              · run for {test.duration}
            </p>
          </div>
        ))}
      </div>
      {result.principles?.length > 0 && (
        <div className="card p-6">
          <h4 className="text-sm font-bold uppercase tracking-widest text-violet-bright">
            Testing rules to live by
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {result.principles.map((principle, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-bright">•</span> {principle}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
