"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { ErrorText, FieldLabel, FunLoading } from "@/components/ui";
import { EXAMPLE_CREATIONS } from "@/lib/examples";
import type { Creation, IdeaAnalysis } from "@/types";

/**
 * Tab 1 — Idea Analyzer (Starter).
 * Analyzes saved creations, and lets brand-new users run a one-tap
 * example (which also saves it as a creation to play with everywhere).
 */
export function AnalyzerTab({
  creations,
  initialAnalyses,
}: {
  creations: Creation[];
  initialAnalyses: Record<string, IdeaAnalysis>;
}) {
  const [localCreations, setLocalCreations] = useState<Creation[]>(creations);
  const [analyses, setAnalyses] =
    useState<Record<string, IdeaAnalysis>>(initialAnalyses);
  const [openId, setOpenId] = useState<string | null>(
    creations.find((c) => initialAnalyses[c.id])?.id ?? null
  );
  const [runningId, setRunningId] = useState<string | null>(null);
  const [exampleRunning, setExampleRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(creationId: string) {
    setRunningId(creationId);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalyses((prev) => ({ ...prev, [creationId]: data.analysis }));
      setOpenId(creationId);
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
              What could your idea earn?
            </h2>
            <p className="helper-text">
              Get a money score out of 10, your best revenue paths, and quick
              wins for this week — in about 15 seconds.
            </p>
          </div>
          <Link href="/onboarding" className="btn-secondary text-sm">
            <Plus size={15} /> Add my creation
          </Link>
        </div>

        <div className="mt-5">
          <FieldLabel helper="No typing. Tap one and we'll analyze it instantly, so you can see exactly how this works.">
            Try an example — one tap
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_CREATIONS.map((example) => (
              <button
                key={example.id}
                type="button"
                disabled={exampleRunning !== null}
                onClick={() => runExample(example.id)}
                className="chip disabled:opacity-50"
              >
                {exampleRunning === example.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <span>{example.emoji}</span>
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
                  {Math.round(analysis.score)}
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
                {analysis && (
                  <button
                    onClick={() => setOpenId(isOpen ? null : creation.id)}
                    className="rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-rain/50"
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                )}
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

            {isOpen && analysis && (
              <div className="border-t border-night-600 bg-night-800/50 p-5">
                <AnalysisResult analysis={analysis} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
