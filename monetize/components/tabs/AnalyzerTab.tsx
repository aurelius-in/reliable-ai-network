"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { EditEvidencePanel } from "@/components/EditEvidencePanel";
import { EvidenceChecklist } from "@/components/EvidenceChecklist";
import { AnalyzerExecutiveBrief } from "@/components/ExecutiveBrief";
import { FirstDollarPath } from "@/components/FirstDollarPath";
import { FullBriefControls } from "@/components/FullBriefControls";
import { MonetizationBriefExport } from "@/components/MonetizationBriefExport";
import { creationToProductContext } from "@/lib/build-full-brief";
import {
  toFounderFacingScore,
} from "@/lib/founder-facing-score";
import {
  DescribeProductForm,
  ErrorText,
  FieldLabel,
  FunLoading,
} from "@/components/ui";
import { TermHint } from "@/components/TermHint";
import { EXAMPLE_CREATIONS } from "@/lib/examples";
import { loadEvidenceAnswers } from "@/lib/evidence-quality";
import { track, trackToolRun } from "@/lib/track";
import type { Creation, IdeaAnalysis } from "@/types";

/**
 * Tab 1 — Idea Analyzer (Starter).
 * Analyzes saved creations, and lets brand-new users run a one-tap
 * example (which also saves it as a creation to play with everywhere).
 */
export function AnalyzerTab({
  creations,
  initialAnalyses,
  onJumpTab,
}: {
  creations: Creation[];
  initialAnalyses: Record<string, IdeaAnalysis>;
  onJumpTab?: (tabId: string) => void;
}) {
  const router = useRouter();
  const [localCreations, setLocalCreations] = useState<Creation[]>(creations);
  const [analyses, setAnalyses] =
    useState<Record<string, IdeaAnalysis>>(initialAnalyses);
  const [openId, setOpenId] = useState<string | null>(
    creations.find((c) => initialAnalyses[c.id])?.id ?? null
  );
  const [runningId, setRunningId] = useState<string | null>(null);
  const [exampleRunning, setExampleRunning] = useState<string | null>(null);
  // Activation: open the brief form when there is nothing to analyze yet
  // (funnel leak: tab opens without a run).
  const [describing, setDescribing] = useState(creations.length === 0);
  const [error, setError] = useState<string | null>(null);

  function handleSaved(creation: Creation) {
    setLocalCreations((prev) => [creation, ...prev]);
    setDescribing(false);
    // Make the new creation available in every other tab too.
    router.refresh();
    void runAnalysis(creation.id);
  }

  async function runAnalysis(creationId: string) {
    setRunningId(creationId);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creationId,
          evidenceChecklist: loadEvidenceAnswers(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalyses((prev) => ({ ...prev, [creationId]: data.analysis }));
      setOpenId(creationId);
      trackToolRun("analyzer", { source: "dashboard" });
      if (data.analysis?.commercial_answer) {
        track("first_run_hard_answer", { source: "dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRunningId(null);
    }
  }

  async function runExample(exampleId: string) {
    const example = EXAMPLE_CREATIONS.find((e) => e.id === exampleId);
    if (!example) return;
    setExampleRunning(exampleId);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: example.title,
          description: example.description,
          type: example.type,
          evidenceChecklist: loadEvidenceAnswers(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      const newCreation: Creation = {
        id: data.creationId,
        user_id: "",
        title: example.title,
        description: example.description,
        type: example.type,
        created_at: new Date().toISOString(),
      };
      setLocalCreations((prev) => [newCreation, ...prev]);
      setAnalyses((prev) => ({ ...prev, [data.creationId]: data.analysis }));
      setOpenId(data.creationId);
      trackToolRun("analyzer", { source: "example" });
      if (data.analysis?.commercial_answer) {
        track("first_run_hard_answer", { source: "example" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setExampleRunning(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Hard commercial answer
            </h2>
            <p className="helper-text">
              Lock one primary buyer, valuable pain, and smallest paid offer
              from your <TermHint id="product_brief">product brief</TermHint>.
              Plus ranked <TermHint id="monetization">monetization</TermHint>{" "}
              paths, kill criteria, and a{" "}
              <TermHint id="validation_plan">validation</TermHint> plan.
              Evidence grades beat polish. Tap dotted words for plain English.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <EvidenceChecklist compact />
        </div>

        <div className="mt-5">
          <FieldLabel helper="Paste a URL or short description. Or try a demo product first.">
            Step 1 — your product
          </FieldLabel>
          <button
            type="button"
            onClick={() => setDescribing((open) => !open)}
            className={`block min-h-[44px] w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] ${
              describing
                ? "border-rain bg-rain/15 text-white shadow-[0_0_14px_rgba(226,0,116,0.22)]"
                : "border-rain/50 bg-night-800 text-white hover:border-rain"
            }`}
          >
            {describing ? "Hide product form" : "Add product (URL or description)"}
          </button>

          {describing && (
            <div className="mt-3">
              <DescribeProductForm onSaved={handleSaved} />
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2">
            {EXAMPLE_CREATIONS.map((example) => (
              <button
                key={example.id}
                type="button"
                disabled={exampleRunning !== null}
                onClick={() => {
                  setDescribing(false);
                  runExample(example.id);
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-night-600 bg-night-800 px-3 py-1.5 text-[13px] font-semibold text-slate-300 transition hover:border-rain/50 hover:text-white active:scale-[0.97] disabled:opacity-50 md:min-h-0"
              >
                {exampleRunning === example.id && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                {example.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ErrorText message={error} />

      {exampleRunning && <FunLoading headline="Analyzing the example…" />}

      {localCreations.length === 0 && !exampleRunning && (
        <p className="text-center text-sm text-slate-500">
          Your analyzed ideas will show up here.
        </p>
      )}

      {localCreations.map((creation) => {
        const analysis = analyses[creation.id];
        const isOpen = openId === creation.id;
        const isRunning = runningId === creation.id;

        return (
          <div key={creation.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4">
              {analysis ? (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-lg font-black gradient-text ring-2 ring-rain/40">
                  {Math.round(toFounderFacingScore(analysis.score).display)}
                </span>
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-slate-500 ring-2 ring-night-600">
                  <Lightbulb size={18} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{creation.title}</p>
                <p className="text-xs capitalize text-slate-400">
                  {creation.type} ·{" "}
                  {new Date(creation.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenId(isOpen ? null : creation.id)}
                  className="min-h-[44px] rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-rain/50 active:scale-[0.96] md:min-h-0"
                >
                  {isOpen ? "Hide" : analysis ? "View" : "Evidence"}
                </button>
                <button
                  onClick={() => runAnalysis(creation.id)}
                  disabled={isRunning}
                  className="btn-primary px-3.5 py-2 text-sm"
                >
                  {isRunning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : analysis ? (
                    <RefreshCw size={14} />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {analysis ? "Re-run" : "Analyze"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="space-y-4 border-t border-night-600 bg-night-800/50 p-5">
                <EditEvidencePanel
                  creation={creation}
                  onUpdated={(next) => {
                    setLocalCreations((prev) =>
                      prev.map((c) => (c.id === next.id ? next : c))
                    );
                    router.refresh();
                  }}
                />
                {analysis && (
                  <>
                    <FullBriefControls
                      bundle={{
                        product: creationToProductContext(creation),
                        analysis,
                      }}
                      executive={
                        <AnalyzerExecutiveBrief analysis={analysis} />
                      }
                    >
                      <MonetizationBriefExport
                        product={creationToProductContext(creation)}
                        analysis={analysis}
                      />
                      <FirstDollarPath
                        steps={{
                          offer:
                            analysis.recommended_paths?.[0]?.name ??
                            "Smallest paid offer from your top path",
                          price:
                            creation.current_price?.trim() || "Set in Pricing",
                          who: "Your best-fit buyer (run Find Your Buyers next)",
                          channel:
                            "Outbound + where that buyer already pays attention",
                          ask: analysis.big_promise,
                          pay_how:
                            "Stripe Checkout, invoice, or store listing linked from the ask",
                          this_week: (
                            analysis.validation_plan?.length
                              ? analysis.validation_plan
                              : analysis.quick_wins ?? []
                          ).slice(0, 5),
                        }}
                        onJump={onJumpTab}
                      />
                      <details className="rounded-xl border border-night-600 bg-night-900/40 open:bg-night-900/60">
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
                          Full analysis in dashboard
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            (paths, evidence grades, kill criteria)
                          </span>
                        </summary>
                        <div className="border-t border-night-600 px-4 py-4">
                          <AnalysisResult
                            analysis={analysis}
                            showFirstRunBanner={false}
                          />
                        </div>
                      </details>
                    </FullBriefControls>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
