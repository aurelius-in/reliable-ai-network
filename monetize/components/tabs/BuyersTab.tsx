"use client";

import { useState } from "react";
import {
  ExternalLink,
  Loader2,
  MapPin,
  Search,
  Target,
  Users,
} from "lucide-react";
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
import { RainBullet } from "@/components/RainBullet";
import { OutputCaveat } from "@/components/OutputCaveat";
import { TermHint } from "@/components/TermHint";
import { BuyerStressTestPanel } from "@/components/BuyerStressTestPanel";
import { GOAL_OPTIONS } from "@/lib/examples";
import { buildLeadDm } from "@/lib/apollo-icp";
import type {
  BuyerPersona,
  BuyerProfilesResult,
  Creation,
  IdeaAnalysis,
} from "@/types";
import type { DemandScanResult } from "@/lib/demand-discovery/types";
import {
  DAILY_MARKET_RESEARCH_PROMISE,
  DAILY_MARKET_RESEARCH_SOURCE_COUNT,
  marketResearchSourceLabels,
} from "@/lib/demand-discovery/sources";
import { track, trackToolRun } from "@/lib/track";
import { WarmNetworkPanel } from "@/components/WarmNetworkPanel";

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

type ApolloLeadRow = {
  name: string;
  title: string;
  company: string | null;
  linkedinUrl: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  headline: string | null;
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
      ...p.objections.map((o) => `- "${o.objection}" -> ${o.answer}`),
      ""
    );
  }
  lines.push("## Go after first", result.best_first_target);
  return lines.join("\n");
}

/**
 * Tab - Find Your Buyers (Starter).
 * Generates 2-3 vivid ideal customer profiles with reachability
 * scores and a ready-to-use positioning one-liner per persona.
 * Optionally enriches a persona with live Apollo leads.
 */
export function BuyersTab({
  creations,
  initialResult,
  initialAnalyses = {},
}: {
  creations: Creation[];
  initialResult: BuyerProfilesResult | null;
  initialAnalyses?: Record<string, IdeaAnalysis>;
}) {
  const first = creations[0];
  const [choice, setChoice] = useState<ProductChoice | null>(
    first ? choiceFromCreation(first) : null
  );
  const [goal, setGoal] = useState("first paying customers");
  const [result, setResult] = useState<BuyerProfilesResult | null>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<DemandScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  async function runDemandScan() {
    if (!choice) return;
    setScanLoading(true);
    setScanError(null);
    try {
      const res = await fetch("/api/demand-discovery/scan", {
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Demand scan failed");
      setScan(data.result);
      trackToolRun("demand_radar", {
        signals: data.result?.signals?.length ?? 0,
      });
      track("first_run_radar", {
        signals: data.result?.signals?.length ?? 0,
      });
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setScanLoading(false);
    }
  }

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
      <div className="rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 via-night-800 to-night-800 p-5 sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rain-bright">
          Daily Market Research
        </p>
        <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
          Scan {DAILY_MARKET_RESEARCH_PROMISE} for buyer conversations
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          One run searches public communities where builders and buyers talk —
          Reddit, Hacker News, Stack Overflow, GitHub, Product Hunt, Indie
          Hackers, DEV, YouTube, G2, and more. Ranked by fit, why now, and
          trust path, not keywords alone. Outreach drafts you approve before
          send.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {DAILY_MARKET_RESEARCH_SOURCE_COUNT} sources targeted:{" "}
          {marketResearchSourceLabels().slice(0, 8).join(", ")}, …
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={runDemandScan}
            disabled={scanLoading || !choice}
            className="btn-primary"
          >
            {scanLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {scan
              ? "Run Daily Market Research again"
              : "Run Daily Market Research"}
          </button>
          <button
            onClick={generate}
            disabled={loading || !choice}
            className="btn-secondary"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Users size={16} />
            )}
            {result ? "Draft hypotheses again" : "Draft buyer hypotheses"}
          </button>
        </div>
        {!choice ? (
          <p className="mt-3 text-xs text-amber-200/90">
            Pick a product below first.
          </p>
        ) : null}
      </div>

      <BuyerStressTestPanel
        creations={creations}
        initialAnalyses={initialAnalyses}
        initialBuyers={result}
      />

      <div className="card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold text-white">
            Find who may pay
          </h2>
          <p className="helper-text">
            Start with people you already know. Then run Daily Market Research
            across {DAILY_MARKET_RESEARCH_PROMISE}. Personas stay hypotheses
            until real replies. Not a guaranteed sale.
          </p>
        </div>

        <ProductPicker creations={creations} value={choice} onChange={setChoice} />

        {choice ? (
          <WarmNetworkPanel
            productKey={choice.creationId ?? choice.title}
            buyerHint={choice.title}
          />
        ) : null}

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

        <p className="text-xs text-slate-500">
          Step 1: warm list. Step 2: Daily Market Research (
          {DAILY_MARKET_RESEARCH_SOURCE_COUNT}+ communities). Step 3: message and
          log replies in Results. Not a promise that someone buys.
        </p>
        <ErrorText message={error || scanError} />
      </div>

      {scanLoading && (
        <FunLoading
          headline={`Daily Market Research across ${DAILY_MARKET_RESEARCH_SOURCE_COUNT}+ communities…`}
        />
      )}

      {!scanLoading && scan && <DemandScanResultView scan={scan} />}

      {loading && <FunLoading headline="Drafting buyer profiles…" />}

      {!loading && result && (
        <BuyersResult
          result={result}
          productTitle={choice?.title ?? undefined}
        />
      )}

      {!loading && !result && !scan && (
        <TeachingEmptyState
          emoji="📡"
          title="Daily Market Research results appear here"
          body={`Run a scan across ${DAILY_MARKET_RESEARCH_PROMISE} for pain and purchase-intent conversations, then draft personas. Always approve outreach before sending.`}
        />
      )}
    </div>
  );
}

function DemandScanResultView({ scan }: { scan: DemandScanResult }) {
  const intentClass: Record<string, string> = {
    high: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/40",
    medium: "bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/40",
    low: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/40",
  };

  return (
    <div className="fade-up space-y-4">
      <div className="card-glow p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-aqua">
          Daily Market Research
        </h3>
        <p className="mt-2 text-sm text-slate-300">
          {scan.signals.length} ranked signal
          {scan.signals.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-white">{scan.productTitle}</span>
          {scan.sourcesTargeted
            ? ` · ${scan.sourcesTargeted}+ communities targeted`
            : ""}
          {scan.sourcesHit?.length
            ? ` · hits from ${scan.sourcesHit.slice(0, 6).join(", ")}${
                scan.sourcesHit.length > 6 ? "…" : ""
              }`
            : ""}
          . Ranked by fit, why now, and trust path. Human-approve every reply.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Queries: {scan.queries.slice(0, 4).join(" · ")}
        </p>
      </div>

      {scan.signals.length === 0 ? (
        <div className="card p-5 text-sm text-slate-400">
          No live hits this run across the communities we reached. Try a richer
          product description or competitor names, then run again tomorrow.
          Daily Market Research is meant to be repeated.
        </div>
      ) : (
        <div className="space-y-3">
          {scan.signals.map((s) => (
            <div key={s.id} className="card space-y-2 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {s.sourceLabel || s.platform}
                    {s.subreddit ? ` · r/${s.subreddit}` : ""}
                  </p>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white hover:text-aqua"
                  >
                    {s.title}{" "}
                    <ExternalLink size={12} className="inline opacity-70" />
                  </a>
                  <p className="mt-1 text-xs text-slate-500">
                    {s.platform}
                    {s.subreddit ? ` · r/${s.subreddit}` : ""} · query:{" "}
                    {s.queryUsed}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    intentClass[s.intent] ?? intentClass.low
                  }`}
                >
                  {s.intent} intent
                </span>
              </div>
              {s.snippet ? (
                <p className="text-sm text-slate-300">{s.snippet}</p>
              ) : null}
              {s.deservesTimeNow ? (
                <p className="text-sm font-semibold text-aqua-bright/95">
                  {s.deservesTimeNow}
                </p>
              ) : null}
              <ul className="space-y-1 text-xs text-slate-400">
                <li>
                  <span className="font-semibold text-slate-300">Fit: </span>
                  {s.fitWhy ?? s.whyMatch}
                </li>
                {s.triggerWhy ? (
                  <li>
                    <span className="font-semibold text-slate-300">
                      Why now:{" "}
                    </span>
                    {s.triggerWhy}
                  </li>
                ) : null}
                {s.trustWhy ? (
                  <li>
                    <span className="font-semibold text-slate-300">
                      Trust path:{" "}
                    </span>
                    {s.trustWhy}
                  </li>
                ) : null}
                <li>
                  <span className="font-semibold text-slate-300">Intent: </span>
                  {s.whyMatch}
                </li>
              </ul>
              <div className="rounded-xl border border-night-600 bg-night-800/70 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Draft outreach (approve before send)
                  </span>
                  <CopyButton text={s.outreachDraft} label="Copy" />
                </div>
                <p className="text-sm text-slate-200">{s.outreachDraft}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BuyersResult({
  result,
  productTitle,
}: {
  result: BuyerProfilesResult;
  productTitle?: string;
}) {
  return (
    <div className="fade-up space-y-5">
      <OutputCaveat tool="buyers" />
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
        {result.personas.map((persona, i) => (
          <PersonaCard
            key={i}
            persona={persona}
            productTitle={productTitle}
          />
        ))}
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

function PersonaCard({
  persona,
  productTitle,
}: {
  persona: BuyerPersona;
  productTitle?: string;
}) {
  const reach = REACH_META[persona.reachability] ?? REACH_META.medium;
  const [leads, setLeads] = useState<ApolloLeadRow[] | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  async function findLeads() {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const res = await fetch("/api/buyers/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, productTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lead search failed");
      setLeads(data.leads ?? []);
    } catch (err) {
      setLeadsError(err instanceof Error ? err.message : "Lead search failed");
    } finally {
      setLeadsLoading(false);
    }
  }

  return (
    <div className="card flex flex-col p-6">
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
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{persona.who}</p>
      <p className="mt-1.5 text-xs text-slate-500">{persona.reachability_why}</p>

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
              <li key={pi} className="flex items-start gap-1.5">
                <RainBullet size={12} className="mt-0.5" />
                <span>{pain}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-night-800 p-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
            ✨ Their wishes
          </p>
          <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-300">
            {persona.desires.map((desire, di) => (
              <li key={di} className="flex items-start gap-1.5">
                <RainBullet size={12} className="mt-0.5" />
                <span>{desire}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          <TermHint id="objection">Objections</TermHint> you&apos;ll hear
        </p>
        {persona.objections.map((obj, oi) => (
          <div key={oi} className="rounded-lg bg-night-800 p-3 text-xs">
            <p className="italic text-slate-400">&ldquo;{obj.objection}&rdquo;</p>
            <p className="mt-1 text-slate-200">
              <span className="font-bold text-rain-bright">Say:</span> {obj.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-rain/40 bg-rain/10 p-3.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-pink">
          <TermHint id="positioning">Positioning</TermHint> one-liner
        </p>
        <p className="mt-1 text-sm font-bold leading-snug text-white">
          {persona.positioning_line}
        </p>
        <div className="mt-2.5">
          <CopyButton text={persona.positioning_line} label="Copy" />
        </div>
      </div>

      <div className="mt-4 border-t border-night-600 pt-4">
        <button
          type="button"
          onClick={findLeads}
          disabled={leadsLoading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          {leadsLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          {leads ? "Refresh matching leads" : "Find matching leads"}
        </button>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Pulls real people from Apollo that look like this buyer profile.
        </p>
        <ErrorText message={leadsError} />

        {leads && leads.length === 0 && !leadsLoading && (
          <p className="mt-3 text-xs text-slate-400">
            Apollo returned no people for this profile&apos;s filters. Hit
            refresh once, or try the other persona.
          </p>
        )}

        {leads && leads.length > 0 && (
          <ul className="mt-3 space-y-2">
            {leads.map((lead, li) => {
              const dm = buildLeadDm({
                leadName: lead.name,
                personaName: persona.name,
                positioningLine: persona.positioning_line,
                productHint: productTitle,
              });
              const location = [lead.city, lead.state, lead.country]
                .filter(Boolean)
                .join(", ");
              return (
                <li
                  key={`${lead.name}-${lead.title}-${li}`}
                  className="rounded-lg bg-night-800 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white">{lead.name}</p>
                      <p className="text-slate-300">
                        {lead.title}
                        {lead.company ? ` @ ${lead.company}` : ""}
                      </p>
                      {location && (
                        <p className="mt-0.5 text-slate-500">{location}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.linkedinUrl && (
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-night-700 px-2 py-1 font-semibold text-aqua hover:underline"
                        >
                          LinkedIn <ExternalLink size={11} />
                        </a>
                      )}
                      <CopyButton text={dm} label="Copy DM" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
