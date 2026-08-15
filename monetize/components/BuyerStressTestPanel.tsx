"use client";

import { useMemo, useState } from "react";
import { Loader2, Swords } from "lucide-react";
import { StressExecutiveBrief } from "@/components/ExecutiveBrief";
import { FullBriefControls } from "@/components/FullBriefControls";
import { creationToProductContext } from "@/lib/build-full-brief";
import { toFounderFacingSurvival } from "@/lib/founder-facing-score";
import {
  CopyButton,
  ErrorText,
  FunLoading,
  ProductPicker,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import type {
  BuyerProfilesResult,
  BuyerStressTestResult,
  Creation,
  IdeaAnalysis,
} from "@/types";

const VERDICT_STYLE: Record<
  BuyerStressTestResult["verdict"],
  { label: string; className: string }
> = {
  survives: {
    label: "Survives",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  fragile: {
    label: "Fragile",
    className: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  },
  dies: {
    label: "Dies",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
  },
};

export function BuyerStressTestPanel({
  creations,
  initialAnalyses = {},
  initialBuyers = null,
}: {
  creations: Creation[];
  initialAnalyses?: Record<string, IdeaAnalysis>;
  initialBuyers?: BuyerProfilesResult | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [result, setResult] = useState<BuyerStressTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seed = useMemo(() => {
    const analysis = choice?.creationId
      ? initialAnalyses[choice.creationId]
      : undefined;
    const persona = initialBuyers?.personas?.[0];
    return {
      audience: persona?.who,
      bigPromise: analysis?.big_promise,
      positioningLine: persona?.positioning_line,
      priceHint: analysis?.commercial_answer?.smallest_paid_offer,
      analysis,
    };
  }, [choice, initialAnalyses, initialBuyers]);

  const product = useMemo(() => {
    if (!choice) return null;
    if (choice.creationId) {
      const c = creations.find((x) => x.id === choice.creationId);
      if (c) return creationToProductContext(c);
    }
    return {
      title: choice.title,
      description: choice.description,
      type: choice.type,
    };
  }, [choice, creations]);

  async function run() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/buyer-stress-test", {
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
          audience: seed.audience,
          bigPromise: seed.bigPromise,
          positioningLine: seed.positioningLine,
          priceHint: seed.priceHint,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Stress test failed");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-pink/40 bg-gradient-to-br from-pink/15 via-night-800 to-night-800 p-5 sm:p-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink">
        Only Make it RAIN
      </p>
      <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
        Buyer Stress Test
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        Survive 5 hard buyer conversations{" "}
        <span className="font-semibold text-white">before</span> you burn
        outreach. War-game the offer on one product brief, then rewrite who may
        pay, the pitch, and your first DM.
      </p>

      <div className="mt-5 space-y-4">
        <ProductPicker
          creations={creations}
          value={choice}
          onChange={setChoice}
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || !choice}
          className="btn-primary"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Swords size={16} />
          )}
          {result ? "Run stress test again" : "Stress-test my offer"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && (
        <FunLoading headline="Putting hostile buyers in the room…" />
      )}

      {!loading && result && product && (
        <div className="mt-5">
          <FullBriefControls
            bundle={{
              product,
              analysis: seed.analysis ?? null,
              stress_test: result,
              cover_note: `Buyer Stress Test for ${product.title}.`,
            }}
            executive={<StressExecutiveBrief result={result} />}
          >
            <details className="rounded-xl border border-night-600 bg-night-900/40">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white">
                Full stress rounds in dashboard
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (dialogue practice)
                </span>
              </summary>
              <div className="border-t border-night-600 px-4 py-4">
                <StressResult result={result} />
              </div>
            </details>
          </FullBriefControls>
        </div>
      )}
    </div>
  );
}

function StressResult({ result }: { result: BuyerStressTestResult }) {
  const style = VERDICT_STYLE[result.verdict];
  const survival = toFounderFacingSurvival(result.survival_score);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${style.className}`}
        >
          {style.label} · {survival}/10
        </span>
      </div>
      <p className="text-lg font-bold text-white">{result.verdict_line}</p>

      <div className="space-y-3">
        {result.rounds.map((round, i) => (
          <div
            key={i}
            className="rounded-xl border border-night-600 bg-night-800/80 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-white">
                Round {i + 1}: {round.buyer_name}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {round.buyer_type} · {round.outcome.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-sm italic text-slate-400">
              “{round.opening_pushback}”
            </p>
            <p className="mt-2 text-sm text-slate-200">
              <span className="font-semibold text-rain-bright">You say: </span>
              {round.founder_best_reply}
            </p>
            <p className="mt-2 text-sm italic text-slate-400">
              “{round.buyer_follow_up}”
            </p>
            <p className="mt-2 text-xs text-slate-500">{round.lesson}</p>
          </div>
        ))}
      </div>

      {result.fatal_objections.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-300">
            Fatal if unanswered
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
            {result.fatal_objections.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-rain/30 bg-rain/5 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-rain-bright">
          Offer rewrite after the test
        </p>
        <p className="mt-2 text-sm text-slate-300">
          <span className="font-semibold text-white">Who may pay: </span>
          {result.offer_rewrite.who_may_pay}
        </p>
        <p className="mt-1 text-sm text-slate-300">
          <span className="font-semibold text-white">Smallest paid offer: </span>
          {result.offer_rewrite.smallest_paid_offer}
        </p>
        <p className="mt-1 text-sm text-slate-300">
          <span className="font-semibold text-white">Pitch: </span>
          {result.offer_rewrite.one_line_pitch}
        </p>
      </div>

      {result.dm_opener_after_test && (
        <div className="rounded-xl border border-night-600 bg-night-800/80 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            DM opener after the test
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
            {result.dm_opener_after_test}
          </p>
          <div className="mt-3">
            <CopyButton text={result.dm_opener_after_test} label="Copy DM" />
          </div>
        </div>
      )}

      {result.do_not_message_until.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-200/80">
            Do not message until
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
            {result.do_not_message_until.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}

      {result.evidence_gaps.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Evidence gaps
          </p>
          {result.evidence_gaps.map((g, i) => (
            <div
              key={i}
              className="rounded-lg border border-night-600 bg-night-900/50 px-3 py-2 text-sm"
            >
              <p className="text-white">
                {g.claim}{" "}
                <span className="text-[10px] font-bold uppercase text-slate-500">
                  {g.grade}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{g.risk}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
