"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, GitBranch, Loader2 } from "lucide-react";
import {
  ChipGroup,
  CopyButton,
  DownloadButton,
  ErrorText,
  FieldLabel,
  FunLoading,
  ProductPicker,
  TeachingEmptyState,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { FirstDollarPath } from "@/components/FirstDollarPath";
import { OutputCaveat } from "@/components/OutputCaveat";
import { TermHint } from "@/components/TermHint";
import { AUDIENCE_OPTIONS, PRICE_BAND_OPTIONS } from "@/lib/examples";
import {
  defaultAudienceFromBuyers,
  defaultMotionFromCreation,
} from "@/lib/tool-defaults";
import type {
  BuyerProfilesResult,
  Creation,
  FunnelPlan,
  FunnelStage,
} from "@/types";

const MOTION_OPTIONS = [
  { value: "outbound", label: "Outbound / sales-led" },
  { value: "plg", label: "Product-led (PLG)" },
  { value: "hybrid", label: "Hybrid" },
];

const STAGE_META: Record<
  FunnelStage["stage"],
  {
    label: string;
    termId: "tripwire" | "core_offer" | "profit_maximizer";
    emoji: string;
    helper: string;
    accent: string;
  }
> = {
  tripwire: {
    label: "Tripwire",
    termId: "tripwire",
    emoji: "🪤",
    helper: "A cheap first offer that turns browsers into buyers.",
    accent: "border-pink/40",
  },
  core_offer: {
    label: "Core Offer",
    termId: "core_offer",
    emoji: "💎",
    helper: "Your main product at its real price — where most money is made.",
    accent: "border-rain/50",
  },
  profit_maximizer: {
    label: "Profit Maximizer",
    termId: "profit_maximizer",
    emoji: "🚀",
    helper: "An upsell for your happiest buyers. Pure extra profit.",
    accent: "border-violet/50",
  },
};

function funnelToMarkdown(funnel: FunnelPlan): string {
  const lines = [`# ${funnel.funnel_name}`, "", funnel.strategy_summary, ""];
  for (const stage of funnel.stages) {
    const meta = STAGE_META[stage.stage];
    lines.push(
      `## ${meta?.label ?? stage.stage}: ${stage.name} — ${stage.price}`,
      "",
      stage.what_it_is,
      "",
      `**Headline:** ${stage.headline}`,
      "",
      stage.pitch,
      "",
      ...stage.bullets.map((b) => `- ${b}`),
      "",
      `**CTA:** ${stage.cta}`,
      "",
      `> Tip: ${stage.conversion_tip}`,
      ""
    );
  }
  lines.push("## Next steps", ...funnel.next_steps.map((s) => `1. ${s}`));
  return lines.join("\n");
}

/**
 * Tab 4 — Funnel Architect (Growth).
 * Builds a tripwire → core offer → profit maximizer funnel with
 * generated copy per stage and a visual flow diagram.
 */
export function FunnelTab({
  creations,
  initialFunnel,
  initialBuyers = null,
  onJumpTab,
}: {
  creations: Creation[];
  initialFunnel: FunnelPlan | null;
  initialBuyers?: BuyerProfilesResult | null;
  onJumpTab?: (tabId: string) => void;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [priceBand, setPriceBand] = useState("mid-market");
  const [audience, setAudience] = useState(() =>
    defaultAudienceFromBuyers(initialBuyers)
  );
  const [motion, setMotion] = useState<string>(() =>
    defaultMotionFromCreation(first)
  );
  const [funnel, setFunnel] = useState<FunnelPlan | null>(initialFunnel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(choice.creationId
            ? { creationId: choice.creationId }
            : {
                title: choice.title,
                description: choice.description,
                type: choice.type,
              }),
          priceBand:
            PRICE_BAND_OPTIONS.find((p) => p.value === priceBand)?.label ??
            priceBand,
          audience,
          motion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Funnel generation failed");
      setFunnel(data.funnel);
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
            Path to paid (funnel)
          </h2>
          <p className="helper-text">
            A <TermHint id="funnel">funnel</TermHint> is the path from stranger
            to paid: entry offer (
            <TermHint id="tripwire">tripwire</TermHint> / pilot) →{" "}
            <TermHint id="core_offer">core offer</TermHint> → expansion (
            <TermHint id="profit_maximizer">upsell</TermHint>). Paste-ready copy
            for every stage.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div>
          <FieldLabel helper="Shapes how the ladder is framed.">
            Go-to-market motion
          </FieldLabel>
          <ChipGroup
            options={MOTION_OPTIONS}
            value={motion}
            onChange={setMotion}
            ariaLabel="Motion"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel helper="Roughly what your main product should cost.">
              Price range
            </FieldLabel>
            <ChipGroup
              options={PRICE_BAND_OPTIONS}
              value={priceBand}
              onChange={setPriceBand}
              ariaLabel="Price range"
            />
          </div>
          <div>
            <FieldLabel helper="Who is most likely to pay for this?">
              Who&apos;s it for?
            </FieldLabel>
            <ChipGroup
              options={AUDIENCE_OPTIONS}
              value={audience}
              onChange={setAudience}
              ariaLabel="Audience"
            />
          </div>
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <GitBranch size={16} />
          )}
          {funnel ? "Rebuild my funnel" : "Build my funnel"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Designing your 3-step funnel…" />}

      {!loading && funnel && (
        <FunnelResult
          funnel={funnel}
          buyerWho={initialBuyers?.best_first_target}
          onJumpTab={onJumpTab}
        />
      )}

      {!loading && !funnel && (
        <TeachingEmptyState
          emoji="🌀"
          title="Your funnel appears here"
          body="Pick a product, tap Build my funnel, and get a visual 3-step money path with ready-to-paste copy for every stage."
        />
      )}
    </div>
  );
}

function FunnelResult({
  funnel,
  buyerWho,
  onJumpTab,
}: {
  funnel: FunnelPlan;
  buyerWho?: string;
  onJumpTab?: (tabId: string) => void;
}) {
  return (
    <div className="fade-up space-y-6">
      <OutputCaveat tool="funnel" />
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">{funnel.funnel_name}</h3>
          <DownloadButton
            filename="my-funnel.md"
            content={funnelToMarkdown(funnel)}
            label="Download funnel"
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {funnel.strategy_summary}
        </p>
        {funnel.motion && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-aqua">
            Motion: {funnel.motion}
          </p>
        )}
      </div>

      {funnel.first_dollar_offer && (
        <FirstDollarPath
          steps={{
            offer: funnel.first_dollar_offer.name,
            price: funnel.first_dollar_offer.price,
            who: buyerWho || "Primary buyer for this funnel",
            channel:
              funnel.motion === "outbound"
                ? "Outbound + landing page"
                : funnel.motion === "plg"
                  ? "Product-led signup + upgrade"
                  : "Hybrid: outreach + product",
            ask: funnel.first_dollar_offer.ask,
            pay_how: "Checkout / invoice linked from CTA",
            this_week: funnel.next_steps?.slice(0, 5) ?? [],
          }}
          onJump={onJumpTab}
        />
      )}

      {/* Visual flow diagram */}
      <div className="card p-6">
        <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
          How buyers flow through it
        </h4>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          {funnel.stages.map((stage, i) => {
            const meta = STAGE_META[stage.stage];
            return (
              <div key={stage.stage} className="contents">
                <div
                  className={`flex-1 rounded-xl border-2 ${meta?.accent ?? "border-night-600"} bg-night-800 p-4 text-center`}
                >
                  <p className="text-2xl">{meta?.emoji}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Step {i + 1} ·{" "}
                    {meta ? (
                      <TermHint id={meta.termId}>{meta.label}</TermHint>
                    ) : (
                      stage.stage
                    )}
                  </p>
                  <p className="mt-1 font-bold text-white">{stage.name}</p>
                  <p className="mt-1 text-lg font-black gradient-text">
                    {stage.price}
                  </p>
                </div>
                {i < funnel.stages.length - 1 && (
                  <div className="flex items-center justify-center text-rain-bright">
                    <ArrowRight size={22} className="hidden md:block" />
                    <ArrowDown size={22} className="md:hidden" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage copy */}
      {funnel.stages.map((stage) => {
        const meta = STAGE_META[stage.stage];
        const stageText = [
          stage.headline,
          "",
          stage.pitch,
          "",
          ...stage.bullets.map((b) => `✓ ${b}`),
          "",
          `[${stage.cta}]`,
        ].join("\n");
        return (
          <div key={stage.stage} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {meta?.emoji}{" "}
                  {meta ? (
                    <TermHint id={meta.termId}>{meta.label}</TermHint>
                  ) : (
                    stage.stage
                  )}{" "}
                  · {stage.price}
                </p>
                <p className="helper-text">{meta?.helper}</p>
              </div>
              <CopyButton text={stageText} label="Copy this stage" />
            </div>
            <h4 className="mt-3 text-xl font-black leading-tight text-white">
              {stage.headline}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {stage.pitch}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
              {stage.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rain-bright">✓</span> {bullet}
                </li>
              ))}
            </ul>
            <p className="btn-primary mt-4 px-4 py-2 text-sm">{stage.cta}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              That button text is your{" "}
              <TermHint id="cta">CTA (call to action)</TermHint>.
            </p>
            <p className="mt-4 rounded-lg bg-night-800 p-3 text-xs leading-relaxed text-slate-400">
              💡{" "}
              <TermHint id="conversion" className="font-semibold !text-slate-300">
                Conversion tip
              </TermHint>
              : {stage.conversion_tip}
            </p>
          </div>
        );
      })}

      <div className="card p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
          Set it up — next steps
        </h4>
        <ol className="mt-3 space-y-2 text-sm text-slate-200">
          {funnel.next_steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rain/20 text-[11px] font-black text-rain-bright">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
