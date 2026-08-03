import { BadgeDollarSign, Quote, Scale } from "lucide-react";
import { CopyButton } from "@/components/ui";
import { FirstDollarPath } from "@/components/FirstDollarPath";
import { OutputCaveat } from "@/components/OutputCaveat";
import { ExplainableText, TermHint } from "@/components/TermHint";
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
      <OutputCaveat tool="pricing" />
      <div className="card-glow p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rain-bright">
          <BadgeDollarSign size={16} /> Recommended Model
        </h3>
        <p className="mt-2 text-xl font-bold capitalize text-white">
          {pricing.recommended_model === "one_time" ? (
            <TermHint id="one_time">one-time</TermHint>
          ) : pricing.recommended_model === "freemium" ? (
            <TermHint id="freemium">freemium</TermHint>
          ) : (
            <TermHint id="subscription">subscription</TermHint>
          )}
        </p>
        <ExplainableText
          as="p"
          className="mt-1.5 text-sm leading-relaxed text-slate-300"
          text={pricing.model_reasoning}
        />
      </div>

      {pricing.willingness_to_pay_logic && (
        <div className="card p-5">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Scale size={14} />{" "}
            <TermHint id="willingness_to_pay">Willingness to pay</TermHint>
          </h4>
          <ExplainableText
            as="p"
            className="mt-2 text-sm leading-relaxed text-slate-200"
            text={pricing.willingness_to_pay_logic}
          />
        </div>
      )}

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
                <ExplainableText text={range.label} />
              </p>
              <p className="mt-2 text-2xl font-black text-white">
                <TermHint id="sweet_spot">{money(range.sweet_spot)}</TermHint>
              </p>
              <p className="text-xs text-slate-400">
                range {money(range.low)} – {money(range.high)}
              </p>
              <ExplainableText
                as="p"
                className="mt-2 text-xs leading-relaxed text-slate-300"
                text={range.notes}
              />
              {recommended && (
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rain-bright">
                  ★ Recommended
                </p>
              )}
            </div>
          );
        })}
      </div>

      {pricing.packaging_tradeoffs && pricing.packaging_tradeoffs.length > 0 && (
        <div className="card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            <TermHint id="packaging">Packaging tradeoffs</TermHint>
          </h4>
          <ul className="rain-list mt-2 space-y-1.5 text-sm text-slate-200">
            {pricing.packaging_tradeoffs.map((t, i) => (
              <li key={i}>
                <ExplainableText text={t} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {pricing.pricing_experiment && (
        <div className="rounded-xl border border-aqua/30 bg-aqua/5 p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-aqua">
            <TermHint id="pricing_experiment">
              Pricing experiment (next 14 days)
            </TermHint>
          </h4>
          <ExplainableText
            as="p"
            className="mt-2 text-sm leading-relaxed text-slate-200"
            text={pricing.pricing_experiment}
          />
        </div>
      )}

      {(() => {
        const range =
          pricing.price_ranges?.find(
            (r) => r.model === pricing.recommended_model
          ) ?? pricing.price_ranges?.[0];
        if (!range) return null;
        return (
          <FirstDollarPath
            steps={{
              offer: pricing.sales_copy?.headline || "Your core offer",
              price: money(range.sweet_spot),
              who: "Best-first buyer from Find Your Buyers",
              channel: "Direct outreach + checkout link",
              ask:
                pricing.sales_copy?.cta ||
                `Would ${money(range.sweet_spot)} get you to a yes this month?`,
              pay_how: "Invoice or checkout in the same thread",
              this_week: [
                pricing.pricing_experiment ||
                  `Offer ${money(range.sweet_spot)} to 10 ideal buyers`,
                "Log replies and objections in What's Working",
                "Adjust packaging using the tradeoffs above",
              ],
            }}
          />
        );
      })()}

      {pricing.value_anchors?.length > 0 && (
        <div className="card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            <TermHint id="value_anchor">Value anchors</TermHint>
            {" "}to use in your copy
          </h4>
          <p className="helper-text">
            Compare your price to something bigger so it feels small. Drop these
            into your sales page.
          </p>
          <ul className="rain-list mt-2 space-y-1.5 text-sm text-slate-200">
            {pricing.value_anchors.map((anchor, i) => (
              <li key={i}>
                <ExplainableText text={anchor} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/8 to-night-700 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-bright">
            <Quote size={16} />{" "}
            <TermHint id="sales_copy">AI Sales Copy</TermHint>
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
