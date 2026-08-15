"use client";

import { useState } from "react";
import { Loader2, Globe } from "lucide-react";
import {
  CopyButton,
  ErrorText,
  FieldLabel,
  FunLoading,
  ProductPicker,
  choiceFromCreation,
  type ProductChoice,
} from "@/components/ui";
import { FullBriefControls } from "@/components/FullBriefControls";
import { ToolMemoExecutiveBrief } from "@/components/ExecutiveBrief";
import { creationToProductContext } from "@/lib/build-full-brief";
import { siteOptimizeToMemo } from "@/lib/tool-memo";
import type { Creation, SiteOptimizeResult } from "@/types";

export function SiteOptimizePanel({
  creations,
}: {
  creations: Creation[];
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [url, setUrl] = useState(() => first?.product_url ?? "");
  const [result, setResult] = useState<SiteOptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPick(next: ProductChoice | null) {
    setChoice(next);
    if (next?.creationId) {
      const c = creations.find((x) => x.id === next.creationId);
      if (c?.product_url) setUrl(c.product_url);
    }
  }

  async function run() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/site-optimize", {
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
          url: url.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Site optimize failed");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/10 via-night-800 to-night-800 p-5 sm:p-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-bright">
        Site Optimize
      </p>
      <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
        Fix the page that should convert
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        Ranked conversion fixes for your live URL — hero, CTA, offer clarity —
        personalized to your product brief. Not generic CRO tips.
      </p>

      <div className="mt-5 space-y-4">
        <ProductPicker creations={creations} value={choice} onChange={onPick} />
        <div>
          <FieldLabel>Product URL</FieldLabel>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourproduct.com"
            className="mt-1 w-full rounded-lg border border-night-600 bg-night-900 px-3 py-2 text-sm text-white outline-none focus:border-violet/50"
          />
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading || !choice || !url.trim()}
          className="btn-primary"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Globe size={16} />
          )}
          {result ? "Re-run site optimize" : "Optimize my site"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Auditing your page…" />}

      {!loading && result && choice && (
        <FullBriefControls
          bundle={{
            product: (() => {
              const c = choice.creationId
                ? creations.find((x) => x.id === choice.creationId)
                : null;
              return c
                ? creationToProductContext(c)
                : {
                    title: choice.title,
                    description: choice.description,
                    type: choice.type,
                    product_url: url.trim() || null,
                  };
            })(),
            tool_memo: siteOptimizeToMemo(result),
            cover_note: `Site Optimize for ${choice.title}.`,
          }}
          executive={
            <ToolMemoExecutiveBrief memo={siteOptimizeToMemo(result)} />
          }
        >
          <div className="mt-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-300">{result.summary}</p>
            <span className="rounded-full bg-violet/15 px-3 py-1 text-xs font-black text-violet-bright">
              {result.score_out_of_10}/10
            </span>
          </div>

          {(result.hero_rewrite.headline || result.hero_rewrite.cta) && (
            <div className="rounded-xl border border-night-600 bg-night-800/80 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Hero rewrite
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {result.hero_rewrite.headline}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {result.hero_rewrite.subhead}
              </p>
              <p className="mt-2 text-xs font-bold text-violet-bright">
                → {result.hero_rewrite.cta}
              </p>
              <div className="mt-3">
                <CopyButton
                  text={`${result.hero_rewrite.headline}\n\n${result.hero_rewrite.subhead}\n\nCTA: ${result.hero_rewrite.cta}`}
                  label="Copy hero"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            {result.fixes.map((fix) => (
              <div
                key={`${fix.priority}-${fix.area}`}
                className="rounded-xl border border-night-600 bg-night-800/80 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-night-700 px-2 py-0.5 text-[10px] font-black text-slate-400">
                    #{fix.priority}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-bright">
                    {fix.area}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {fix.problem}
                </p>
                <p className="mt-1 text-sm text-slate-300">{fix.fix}</p>
                {fix.rewrite && (
                  <div className="mt-3">
                    <p className="whitespace-pre-wrap text-xs text-slate-400">
                      {fix.rewrite}
                    </p>
                    <div className="mt-2">
                      <CopyButton text={fix.rewrite} label="Copy rewrite" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </FullBriefControls>
      )}
    </div>
  );
}
