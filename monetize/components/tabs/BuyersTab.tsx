"use client";

import { useState } from "react";
import { Loader2, MapPin, Target, Users } from "lucide-react";
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
import { GOAL_OPTIONS } from "@/lib/examples";
import type { BuyerPersona, BuyerProfilesResult, Creation } from "@/types";

const REACH_META: Record<
  BuyerPersona["reachability"],
  { label: string; className: string }
> = {
  easy: {
    label: "Easy to reach",
    className: "bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/40",
  },
  medium: {
    label: "Medium effort",
    className: "bg-amber-300/10 text-amber-300 ring-1 ring-amber-300/40",
  },
  hard: {
    label: "Harder to reach",
    className: "bg-red-400/10 text-red-400 ring-1 ring-red-400/40",
  },
};

function buyersToMarkdown(result: BuyerProfilesResult): string {
  const lines = ["# Your ideal buyers", "", result.headline_insight, ""];
  for (const p of result.personas) {
    lines.push(
      `## ${p.emoji} ${p.name} (${p.reachability} to reach)`,
      "",
      p.who,
      "",
      `**Positioning line:** ${p.positioning_line}`,
      "",
      "**Where to find them:**",
      ...p.where_online.map((w) => `- ${w}`),
      "",
      "**Pain points:**",
      ...p.pain_points.map((x) => `- ${x}`),
      "",
      "**What they want:**",
      ...p.desires.map((x) => `- ${x}`),
      "",
      "**Objections & answers:**",
      ...p.objections.map((o) => `- "${o.objection}" → ${o.answer}`),
      ""
    );
  }
  lines.push("## Go after first", result.best_first_target);
  return lines.join("\n");
}

/**
 * Tab — Find Your Buyers (Starter).
 * Generates 2-3 vivid ideal customer profiles with reachability
 * scores and a ready-to-use positioning one-liner per persona.
 */
export function BuyersTab({
  creations,
  initialResult,
}: {
  creations: Creation[];
  initialResult: BuyerProfilesResult | null;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [goal, setGoal] = useState("steady side income");
  const [result, setResult] = useState<BuyerProfilesResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!choice) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/buyers", {
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
          goal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Buyer research failed");
      setResult(data.result);
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
            Find the people who&apos;ll actually pay you
          </h2>
          <p className="helper-text">
            Most creators guess who their buyers are — and guess wrong. This
            builds 2-3 crystal-clear buyer profiles: who they are, where they
            hang out online, and the exact words that make them buy.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        <div>
          <FieldLabel helper="Helps us pick buyers that match your ambition.">
            What are you going for?
          </FieldLabel>
          <ChipGroup
            options={GOAL_OPTIONS}
            value={goal}
            onChange={setGoal}
            ariaLabel="Income goal"
            columns={3}
          />
        </div>

        <button onClick={generate} disabled={loading || !choice} className="btn-primary">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Users size={16} />
          )}
          {result ? "Find my buyers again" : "Find my buyers"}
        </button>
        <ErrorText message={error} />
      </div>

      {loading && <FunLoading headline="Profiling your perfect buyers…" />}

      {!loading && result && <BuyersResult result={result} />}

      {!loading && !result && (
        <TeachingEmptyState
          emoji="🎯"
          title="Your buyer profiles appear here"
          body="Pick a product, tap Find my buyers, and meet the 2-3 kinds of people most likely to pay you — with the exact places to find them online."
        />
      )}
    </div>
  );
}

function BuyersResult({ result }: { result: BuyerProfilesResult }) {
  return (
    <div className="fade-up space-y-5">
      <div className="card-glow p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rain-bright">
            💡 The big insight
          </h3>
          <DownloadButton
            filename="my-buyers.md"
            content={buyersToMarkdown(result)}
            label="Download profiles"
          />
        </div>
        <p className="mt-2 text-lg font-bold leading-snug text-white">
          {result.headline_insight}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.personas.map((persona, i) => {
          const reach = REACH_META[persona.reachability] ?? REACH_META.medium;
          return (
            <div key={i} className="card flex flex-col p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-lg font-black text-white">
                  {persona.emoji} {persona.name}
                </h4>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${reach.className}`}
                >
                  {reach.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {persona.who}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">
                {persona.reachability_why}
              </p>

              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={12} /> Where they hang out
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {persona.where_online.map((place, pi) => (
                    <span
                      key={pi}
                      className="rounded-full bg-night-800 px-2.5 py-1 text-xs font-semibold text-slate-300 ring-1 ring-night-600"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-night-800 p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-400">
                    😩 Their pains
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-300">
                    {persona.pain_points.map((pain, pi) => (
                      <li key={pi}>• {pain}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-night-800 p-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                    ✨ Their wishes
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-300">
                    {persona.desires.map((desire, di) => (
                      <li key={di}>• {desire}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {persona.objections.map((obj, oi) => (
                  <div key={oi} className="rounded-lg bg-night-800 p-3 text-xs">
                    <p className="italic text-slate-400">
                      &ldquo;{obj.objection}&rdquo;
                    </p>
                    <p className="mt-1 text-slate-200">
                      <span className="font-bold text-rain-bright">Say:</span>{" "}
                      {obj.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-rain/40 bg-rain/10 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-pink">
                  Your one-liner for them
                </p>
                <p className="mt-1 text-sm font-bold leading-snug text-white">
                  {persona.positioning_line}
                </p>
                <div className="mt-2.5">
                  <CopyButton text={persona.positioning_line} label="Copy" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400">
          <Target size={15} /> Go after this group first
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {result.best_first_target}
        </p>
      </div>
    </div>
  );
}
