"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { FirstRunSuccess } from "@/components/FirstRunSuccess";
import { EvidenceChecklist } from "@/components/EvidenceChecklist";
import { ChipGroup, ErrorText, FieldLabel, FunLoading } from "@/components/ui";
import { AUDIENCE_OPTIONS, EXAMPLE_CREATIONS } from "@/lib/examples";
import { loadEvidenceAnswers } from "@/lib/evidence-quality";
import { track, trackToolRun } from "@/lib/track";
import type { IdeaAnalysis } from "@/types";
import {
  hostnameFromProductUrl,
  readPendingProductUrl,
} from "@/lib/pending-product-url";

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
  const [productUrl, setProductUrl] = useState("");
  const [extra, setExtra] = useState("");
  const [exampleId, setExampleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);

  useEffect(() => {
    track("onboarding_view");
    const stored = readPendingProductUrl();
    if (stored) {
      setProductUrl(stored);
      const host = hostnameFromProductUrl(stored);
      if (host) setTitle((current) => current || host);
    }
  }, []);

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
    product_url?: string;
  }) {
    setLoading(true);
    setError(null);
    track("onboarding_analyze_start", {
      has_url: Boolean(payload.product_url),
      used_example: Boolean(exampleId),
    });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          evidenceChecklist: loadEvidenceAnswers(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setAnalysis(data.analysis);
      trackToolRun("analyzer", { source: "onboarding" });
      track("onboarding_analyze_success", {
        has_commercial_answer: Boolean(data.analysis?.commercial_answer),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      track("onboarding_analyze_error");
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

    const audienceLabel =
      AUDIENCE_OPTIONS.find((a) => a.value === audience)?.value ?? audience;
    const urlBit = productUrl.trim()
      ? ` Product URL: ${productUrl.trim()}.`
      : "";
    const resolvedTitle =
      title.trim() || hostnameFromProductUrl(productUrl) || "Untitled product";
    const description = usingExample
      ? `${example.description}${urlBit}${extra.trim() ? ` Extra details: ${extra.trim()}` : ""}`
      : `A ${type} called "${resolvedTitle}" made for ${audienceLabel}.${urlBit}${
          extra.trim() ? ` ${extra.trim()}` : ""
        }`;

    await runAnalysis({
      title: resolvedTitle,
      description,
      type: usingExample ? example.type : type,
      ...(productUrl.trim() ? { product_url: productUrl.trim() } : {}),
    });
  }

  if (analysis) {
    return (
      <div className="space-y-6">
        <FirstRunSuccess analysis={analysis} source="onboarding" />
        <details className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-200">
            See full brief
          </summary>
          <div className="mt-4">
            <AnalysisResult analysis={analysis} showFirstRunBanner={false} />
          </div>
        </details>
      </div>
    );
  }

  if (loading) {
        <FunLoading headline="Finding who may pay…" />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <FieldLabel helper="One tap fills the form. Or enter your own.">
          Try an example
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
        <label
          htmlFor="title"
          className="mb-1.5 block text-sm font-semibold text-white"
        >
          Product name
        </label>
        <input
          id="title"
          type="text"
          required={!productUrl.trim()}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ops Copilot"
          className="input-dark"
        />
      </div>

      <div>
        <label
          htmlFor="productUrl"
          className="mb-1.5 block text-sm font-semibold text-white"
        >
          Product URL{" "}
          <span className="font-normal text-slate-500">(recommended)</span>
        </label>
        <input
          id="productUrl"
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://"
          className="input-dark"
          autoComplete="url"
        />
        <p className="helper-text">Sharpens evidence. Skip if you only have a description.</p>
      </div>

      <div>
        <FieldLabel helper="Closest match is fine.">Type</FieldLabel>
        <ChipGroup
          options={CREATION_TYPES}
          value={type}
          onChange={setType}
          ariaLabel="Creation type"
        />
      </div>

      <div>
        <FieldLabel helper="Who is it for?">Audience</FieldLabel>
        <ChipGroup
          options={AUDIENCE_OPTIONS}
          value={audience}
          onChange={setAudience}
          ariaLabel="Audience"
        />
      </div>

      <div>
        <label
          htmlFor="extra"
          className="mb-1.5 block text-sm font-semibold text-white"
        >
          Extra detail{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="extra"
          rows={2}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="What it does in one sentence"
          className="input-dark"
        />
      </div>

      <EvidenceChecklist compact />

      <ErrorText message={error} />

      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Sparkles size={18} />
        )}
        Get my First Customer Path
      </button>
    </form>
  );
}
