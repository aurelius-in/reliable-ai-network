"use client";

import { useState } from "react";
import { BadgeDollarSign, Loader2 } from "lucide-react";
import { PricingResult } from "@/components/PricingResult";
import { FullBriefControls } from "@/components/FullBriefControls";
import { PricingExecutiveBrief } from "@/components/ExecutiveBrief";
import { creationToProductContext } from "@/lib/build-full-brief";
import {
  ErrorText,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { TermHint } from "@/components/TermHint";
import type { Creation, PricingRecommendation } from "@/types";

/**
 * Tab 2 — Pricing & Packaging Builder (Starter).
 * Pick a product (or a one-tap example) → get price ranges, the best
 * packaging model, and ready-to-paste sales copy.
 */
export function PricingTab({
  creations,
  initialPricings,
}: {
  creations: Creation[];
  initialPricings: Record<string, PricingRecommendation>;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [pricings, setPricings] =
    useState<Record<string, PricingRecommendation>>(initialPricings);
  const [examplePricing, setExamplePricing] =
    useState<PricingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricing = choice?.creationId
    ? pricings[choice.creationId]
    : examplePricing;
  const selectedCreation = choice?.creationId
    ? creations.find((c) => c.id === choice.creationId)
    : null;

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          choice.creationId
            ? { creationId: choice.creationId }
            : {
                title: choice.title,
                description: choice.description,
                type: choice.type,
              }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pricing generation failed");
      if (choice.creationId) {
        setPricings((prev) => ({ ...prev, [choice.creationId!]: data.pricing }));
      } else {
        setExamplePricing(data.pricing);
      }
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
            <TermHint id="pricing_economics">Pricing economics</TermHint>
          </h2>
          <p className="helper-text">
            <TermHint id="willingness_to_pay">Willingness-to-pay</TermHint>{" "}
            logic, <TermHint id="packaging">packaging</TermHint> tradeoffs, and
            a concrete experiment — not just a price guess. Better briefs
            produce better numbers. Tap dotted words for plain-English
            meanings.
          </p>
        </div>

        <ProductPicker
          creations={creations}
          value={choice}
          onChange={setChoice}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            disabled={loading || !choice}
            className="btn-primary"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <BadgeDollarSign size={16} />
            )}
            {pricing ? "Regenerate pricing" : "Build my pricing"}
          </button>
          {choice && (
            <p className="text-xs text-slate-500">
              Pricing: <span className="text-slate-300">{choice.title}</span>
            </p>
          )}
        </div>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Building your pricing…" />}

      {!loading && pricing && choice && (
        <FullBriefControls
          bundle={{
            product: selectedCreation
              ? creationToProductContext(selectedCreation)
              : {
                  title: choice.title,
                  description: choice.description,
                  type: choice.type,
                },
            pricing,
          }}
          executive={<PricingExecutiveBrief pricing={pricing} />}
        >
          <details className="rounded-xl border border-night-600 bg-night-800/50 open:border-aqua/30">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white">
              Full pricing detail
            </summary>
            <div className="border-t border-night-600 px-1 pb-2 pt-1">
              <PricingResult pricing={pricing} />
            </div>
          </details>
        </FullBriefControls>
      )}

      {!loading && !pricing && (
        <TeachingEmptyState
          emoji="🏷️"
          title="Your pricing plan appears here"
          body="Pick a product above (or tap an example) and hit Build my pricing. You'll get 3 price options, the best model for your product, and sales copy."
        />
      )}
    </div>
  );
}
