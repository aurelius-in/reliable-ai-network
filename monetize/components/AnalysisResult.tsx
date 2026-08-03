import Link from "next/link";
import { CheckCircle2, FlaskConical, ShieldAlert, Target, TrendingUp } from "lucide-react";
import { CopyButton } from "@/components/ui";
import { OutputCaveat } from "@/components/OutputCaveat";
import { ExplainableText, TermHint } from "@/components/TermHint";
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

const CONFIDENCE_COLORS: Record<string, string> = {
  low: "text-amber-300",
  medium: "text-slate-300",
  high: "text-emerald-400",
};

/** Honest score display — no fake decimal theater. */
function displayScore(analysis: IdeaAnalysis): string {
  const raw = Math.max(1, Math.min(10, Number(analysis.score) || 1));
  if (Number.isInteger(raw)) return String(raw);
  return raw.toFixed(1);
}

export function AnalysisResult({ analysis }: { analysis: IdeaAnalysis }) {
  const score = displayScore(analysis);
  const confidence = (analysis.confidence || "").toLowerCase();

  return (
    <div className="fade-up space-y-6">
      <OutputCaveat tool="analyzer" />

      <div className="glow-card card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">
              <TermHint id="commercial_score">Commercial score</TermHint>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Directional estimate from your brief and evidence, not a market
              audit. Tap dotted words for plain English.{" "}
              <Link
                href="/methodology"
                className="font-semibold text-aqua hover:text-aqua-bright"
              >
                How scoring works
              </Link>
              .
            </p>
          </div>
          {confidence && (
            <span
              className={`rounded-full bg-night-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                CONFIDENCE_COLORS[confidence] ?? "text-slate-300"
              }`}
            >
              {confidence}{" "}
              <TermHint id="confidence" className="!normal-case !tracking-normal !text-inherit">
                confidence
              </TermHint>
            </span>
          )}
        </div>
        <div className="relative mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-night-800 ring-4 ring-rain/40">
          <span className="text-3xl font-black gradient-text">{score}</span>
          <span className="absolute -bottom-1 rounded-full bg-night-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            / 10
          </span>
        </div>
        <ExplainableText
          as="p"
          className="mt-4 text-sm leading-relaxed text-slate-300"
          text={analysis.score_reasoning}
        />
      </div>

      <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/10 to-night-700 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
            <Target size={16} />{" "}
            <TermHint id="big_promise">Your Big Promise</TermHint>
          </h3>
          <CopyButton text={analysis.big_promise} />
        </div>
        <p className="mt-3 text-lg font-semibold leading-snug text-white">
          &ldquo;{analysis.big_promise}&rdquo;
        </p>
        <p className="helper-text">
          Put this at the top of every page. Test it with real buyers before you scale it.
        </p>
      </div>

      {(analysis.assumptions?.length || analysis.kill_criteria?.length) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.assumptions && analysis.assumptions.length > 0 && (
            <div className="card p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-300">
                <FlaskConical size={15} />{" "}
                <TermHint id="assumptions">Assumptions</TermHint>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {analysis.assumptions.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <ExplainableText text={a} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.kill_criteria && analysis.kill_criteria.length > 0 && (
            <div className="card p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-300">
                <ShieldAlert size={15} />{" "}
                <TermHint id="kill_criteria">Kill criteria</TermHint>
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {analysis.kill_criteria.map((k, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-400/80">•</span>
                    <ExplainableText text={k} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rain-bright">
          <TrendingUp size={16} />{" "}
          <TermHint id="monetization">Ways To Earn</TermHint>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.recommended_paths?.map((path, i) => (
            <div
              key={i}
              className="rounded-xl border border-night-600 bg-night-700 p-4 transition hover:border-rain/50"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-white">
                  <ExplainableText text={path.name} />
                </h4>
                <span className="shrink-0 rounded-full bg-night-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  #{i + 1}
                </span>
              </div>
              <ExplainableText
                as="p"
                className="mt-1.5 text-sm leading-relaxed text-slate-300"
                text={path.description}
              />
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

      <div className="card p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
          <TermHint id="quick_wins">Quick Wins This Week</TermHint>
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
              <ExplainableText text={win} />
            </li>
          ))}
        </ul>
      </div>

      {analysis.validation_plan && analysis.validation_plan.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-aqua">
            <TermHint id="validation_plan">Validation plan</TermHint>
          </h3>
          <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm text-slate-200">
            {analysis.validation_plan.map((step, i) => (
              <li key={i}>
                <ExplainableText text={step} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {analysis.citations && analysis.citations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">
            Evidence grades
          </h3>
          <p className="helper-text">
            Observed = scraped/fetched · Founder-reported = you provided ·
            Assumed = inference without direct evidence
          </p>
          <ul className="mt-4 space-y-3">
            {analysis.citations.map((c, i) => (
              <li
                key={i}
                className="rounded-lg border border-night-600 bg-night-800/80 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      c.grade === "observed"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : c.grade === "founder_reported"
                          ? "bg-aqua/15 text-aqua"
                          : "bg-amber-400/15 text-amber-300"
                    }`}
                  >
                    {c.grade.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-500">{c.source}</span>
                </div>
                <p className="mt-1.5 text-slate-200">{c.claim}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.competitor_enrichment &&
        analysis.competitor_enrichment.length > 0 && (
          <div className="card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-violet-bright">
              Competitor firmographics (Apollo)
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {analysis.competitor_enrichment.map((row, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-night-600 bg-night-800 p-3 text-sm"
                >
                  <p className="font-semibold text-white">{row.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {[row.industry, row.domain, row.employeeCount != null
                      ? `~${row.employeeCount} employees`
                      : null]
                      .filter(Boolean)
                      .join(" · ") || "No firmographic match"}
                  </p>
                  {row.websiteUrl && (
                    <a
                      href={row.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs text-aqua hover:underline"
                    >
                      {row.websiteUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
