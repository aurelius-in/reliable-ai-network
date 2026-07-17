"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import type { IdeaAnalysis } from "@/types";

const CREATION_TYPES = [
  { value: "app", label: "App" },
  { value: "game", label: "Game" },
  { value: "tool", label: "Tool" },
  { value: "saas", label: "SaaS" },
  { value: "content", label: "Content / Media" },
  { value: "other", label: "Other" },
];

export function OnboardingForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("app");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (analysis) {
    return (
      <div className="space-y-8">
        <div className="fade-up text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-bold text-gold ring-1 ring-gold/40">
            <Sparkles size={15} />
            Your personalized monetization system is ready
          </p>
        </div>
        <AnalysisResult analysis={analysis} />
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-gradient-to-r from-electric to-electric-bright px-8 py-3.5 font-bold text-white shadow-lg shadow-electric/30 transition hover:brightness-110"
          >
            Go to my dashboard →
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-night-600 bg-night-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-electric focus:ring-2 focus:ring-electric/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-300">
          What did you build?
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AI Recipe Generator"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-300">
          What kind of creation is it?
        </label>
        <div className="flex flex-wrap gap-2">
          {CREATION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                type === t.value
                  ? "bg-electric text-white shadow shadow-electric/30"
                  : "border border-night-600 bg-night-800 text-slate-300 hover:border-electric/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-semibold text-slate-300"
        >
          Describe it — what does it do, and who is it for?
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="The more detail you give, the sharper your monetization plan will be."
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-electric-bright px-6 py-3.5 font-bold text-white shadow-lg shadow-electric/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing your creation…
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Analyze my creation
          </>
        )}
      </button>
      {loading && (
        <p className="text-center text-xs text-slate-500">
          Our AI is scoring your idea against proven monetization frameworks. This
          takes ~15 seconds.
        </p>
      )}
    </form>
  );
}
