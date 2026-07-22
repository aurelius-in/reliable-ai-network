import { BadgeDollarSign, Quote } from "lucide-react";
import { CopyButton } from "@/components/ui";
import type { PricingRecommendation } from "@/types";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function salesCopyText(pricing: PricingRecommendation): string {
  const copy = pricing.sales_copy;
  return [
    copy?.headline,
    copy?.subheadline,
    "",
    ...(copy?.bullets?.map((b) => `✓ ${b}`) ?? []),
    "",
    `[${copy?.cta}]`,
  ].join("\n");
}

export function PricingResult({ pricing }: { pricing: PricingRecommendation }) {
  return (
    <div className="fade-up space-y-6">
      <div className="card-glow p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rain-bright">
          <BadgeDollarSign size={16} /> Recommended Model
        </h3>
        <p className="mt-2 text-xl font-bold capitalize text-white">
          {pricing.recommended_model.replace("_", "-")}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          {pricing.model_reasoning}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {pricing.price_ranges?.map((range, i) => {
          const recommended = range.model === pricing.recommended_model;
          return (
            <div
              key={i}
              className={`rounded-xl border p-4 ${
                recommended
                  ? "border-rain/50 bg-gradient-to-b from-rain/10 to-night-700"
                  : "border-night-600 bg-night-700"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {range.label}
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                {money(range.sweet_spot)}
              </p>
              <p className="text-xs text-slate-400">
                range {money(range.low)} – {money(range.high)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {range.notes}
              </p>
              {recommended && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rain-bright">
                  ★ Recommended
                </p>
              )}
            </div>
          );
        })}
      </div>

      {pricing.value_anchors?.length > 0 && (
        <div className="card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Value anchors to use in your copy
          </h4>
          <p className="helper-text">
            A value anchor compares your price to something bigger, so it feels
            tiny. Drop these into your sales page.
          </p>
          <ul className="rain-list mt-2 space-y-1.5 text-sm text-slate-200">
            {pricing.value_anchors.map((anchor, i) => (
              <li key={i}>{anchor}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/8 to-night-700 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
            <Quote size={16} /> AI Sales Copy
          </h3>
          <CopyButton text={salesCopyText(pricing)} label="Copy all" />
        </div>
        <p className="mt-3 text-2xl font-black leading-tight text-white">
          {pricing.sales_copy?.headline}
        </p>
        <p className="mt-2 text-slate-300">{pricing.sales_copy?.subheadline}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-200">
          {pricing.sales_copy?.bullets?.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-rain-bright">✓</span> {bullet}
            </li>
          ))}
        </ul>
        <p className="btn-primary mt-5">{pricing.sales_copy?.cta}</p>
      </div>
    </div>
  );
}
