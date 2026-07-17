"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { ChipGroup, ErrorText, FieldLabel, FunLoading } from "@/components/ui";
import { AUDIENCE_OPTIONS, EXAMPLE_CREATIONS } from "@/lib/examples";
import type { IdeaAnalysis } from "@/types";

const CREATION_TYPES = [
  { value: "app", label: "📱 App" },
  { value: "game", label: "🎮 Game" },
  { value: "tool", label: "🔧 Tool" },
  { value: "saas", label: "☁️ SaaS" },
  { value: "content", label: "🎨 Content / Templates" },
  { value: "other", label: "✨ Other" },
];

export function OnboardingForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("app");
  const [audience, setAudience] = useState("creators");
  const [extra, setExtra] = useState("");
  const [exampleId, setExampleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);

  function applyExample(id: string) {
    const example = EXAMPLE_CREATIONS.find((e) => e.id === id);
    if (!example) return;
    setExampleId(id);
    setTitle(example.title);
    setType(example.type);
  }

  async function runAnalysis(payload: {
    title: string;
    description: string;
    type: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const example = exampleId
      ? EXAMPLE_CREATIONS.find((x) => x.id === exampleId)
      : null;
    const usingExample = example && title === example.title;

    // Build a rich description from the chips — no typing required.
    const audienceLabel =
      AUDIENCE_OPTIONS.find((a) => a.value === audience)?.value ?? audience;
    const description = usingExample
      ? `${example.description}${extra.trim() ? ` Extra details: ${extra.trim()}` : ""}`
      : `A ${type} called "${title.trim()}" made for ${audienceLabel}.${
          extra.trim() ? ` ${extra.trim()}` : ""
        }`;

    await runAnalysis({
      title: title.trim(),
      description,
      type: usingExample ? example.type : type,
    });
  }

  if (analysis) {
    return (
      <div className="space-y-8">
        <div className="fade-up text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-rain/15 px-4 py-1.5 text-sm font-bold text-rain-bright ring-1 ring-rain/40">
            <Sparkles size={15} />
            Your personalized monetization system is ready
          </p>
        </div>
        <AnalysisResult analysis={analysis} />
        <div className="text-center">
          <Link href="/dashboard" className="btn-primary px-8 py-3.5">
            Go to my dashboard →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <FunLoading headline="Analyzing your creation…" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <FieldLabel helper="No idea yet? Tap one and we'll fill everything in for you.">
          Try an example — one tap
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_CREATIONS.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => applyExample(example.id)}
              className={`chip ${exampleId === example.id && title === example.title ? "chip-on" : ""}`}
            >
              {example.emoji} {example.title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-white">
          What&apos;s it called?
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AI Recipe Generator"
          className="input-dark"
        />
        <p className="helper-text">A working name is fine — you can change it later.</p>
      </div>

      <div>
        <FieldLabel helper="Pick the closest match.">
          What kind of creation is it?
        </FieldLabel>
        <ChipGroup
          options={CREATION_TYPES}
          value={type}
          onChange={setType}
          ariaLabel="Creation type"
        />
      </div>

      <div>
        <FieldLabel helper="Who would love this the most?">
          Who&apos;s it for?
        </FieldLabel>
        <ChipGroup
          options={AUDIENCE_OPTIONS}
          value={audience}
          onChange={setAudience}
          ariaLabel="Audience"
        />
      </div>

      <div>
        <label htmlFor="extra" className="mb-1.5 block text-sm font-semibold text-white">
          Anything else? <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="extra"
          rows={2}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="e.g. It also makes shopping lists"
          className="input-dark"
        />
        <p className="helper-text">
          More detail makes the plan sharper — but the chips alone are enough.
        </p>
      </div>

      <ErrorText message={error} />

      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Sparkles size={18} />
        )}
        Analyze my creation
      </button>
    </form>
  );
}
