"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  ProductPicker,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import {
  buildTemplateFillInput,
  fillTemplatePlaceholders,
} from "@/lib/fill-template";
import { QUICK_START_TEMPLATES } from "@/lib/templates";
import type {
  BuyerProfilesResult,
  Creation,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";

/**
 * Offer & page starters — product-aware templates with one-click fill.
 */
export function LibraryTab({
  creations = [],
  initialAnalyses = {},
  initialBuyers = null,
  initialPricings = {},
}: {
  creations?: Creation[];
  initialAnalyses?: Record<string, IdeaAnalysis>;
  initialBuyers?: BuyerProfilesResult | null;
  initialPricings?: Record<string, PricingRecommendation>;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [filledOnly, setFilledOnly] = useState(true);

  const product = useMemo(() => {
    if (!choice) return null;
    const creation = choice.creationId
      ? creations.find((c) => c.id === choice.creationId)
      : null;
    const analysis = choice.creationId
      ? initialAnalyses[choice.creationId]
      : undefined;
    const pricing = choice.creationId
      ? initialPricings[choice.creationId]
      : Object.values(initialPricings)[0];
    return buildTemplateFillInput({
      title: choice.title,
      description: choice.description,
      type: choice.type,
      current_price: creation?.current_price,
      analysis: analysis ?? null,
      buyers: initialBuyers,
      pricing: pricing ?? null,
    });
  }, [choice, creations, initialAnalyses, initialBuyers, initialPricings]);

  return (
    <div className="space-y-4">
      <div className="card space-y-4 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">Offer &amp; page starters</h2>
          <p className="helper-text">
            Proven page, email, and listing structures. Pick your product and we
            fill from Analyzer, Buyers, and Pricing so you can ship this week.
          </p>
        </div>
        <ProductPicker
          creations={creations}
          value={choice}
          onChange={setChoice}
        />
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={filledOnly}
            onChange={(e) => setFilledOnly(e.target.checked)}
            className="rounded border-night-600"
          />
          Show filled version (product + promise + buyer + price when available)
        </label>
      </div>

      {QUICK_START_TEMPLATES.map((template) => {
        const body =
          filledOnly && product
            ? fillTemplatePlaceholders(template.content, product)
            : template.content;
        return (
          <div key={template.id} className="card overflow-hidden">
            <div className="space-y-3 p-5">
              <div>
                <h3 className="font-bold text-white">{template.title}</h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  {template.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setPreviewId(previewId === template.id ? null : template.id)
                  }
                  className="min-h-[44px] rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-rain/50 active:scale-[0.96] md:min-h-0"
                >
                  {previewId === template.id ? "Hide" : "Preview"}
                </button>
                <CopyButton text={body} label="Copy" />
                <DownloadButton
                  filename={
                    filledOnly && product
                      ? `${product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32)}-${template.filename}`
                      : template.filename
                  }
                  content={body}
                />
              </div>
            </div>
            {previewId === template.id && (
              <pre className="max-h-96 overflow-auto border-t border-night-600 bg-night-800/70 p-5 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
                {body}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
