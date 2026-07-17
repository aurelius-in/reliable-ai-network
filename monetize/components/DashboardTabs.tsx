"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  BookOpen,
  Download,
  Lightbulb,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { PricingResult } from "@/components/PricingResult";
import { QUICK_START_TEMPLATES } from "@/lib/templates";
import type { Creation, IdeaAnalysis, PricingRecommendation } from "@/types";

type StarterTab = "analyzer" | "pricing" | "library";

interface DashboardTabsProps {
  creations: Creation[];
  initialAnalyses: Record<string, IdeaAnalysis>;
  initialPricings: Record<string, PricingRecommendation>;
}

const TABS: { id: StarterTab; label: string; icon: React.ReactNode }[] = [
  { id: "analyzer", label: "Idea Analyzer", icon: <Lightbulb size={16} /> },
  { id: "pricing", label: "Pricing & Packaging", icon: <BadgeDollarSign size={16} /> },
  { id: "library", label: "Quick-Start Library", icon: <BookOpen size={16} /> },
];

export function DashboardTabs({
  creations,
  initialAnalyses,
  initialPricings,
}: DashboardTabsProps) {
  const [tab, setTab] = useState<StarterTab>("analyzer");

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-electric text-white shadow-lg shadow-electric/25"
                : "border border-night-600 bg-night-700 text-slate-300 hover:border-electric/50 hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "analyzer" && (
          <AnalyzerTab creations={creations} initialAnalyses={initialAnalyses} />
        )}
        {tab === "pricing" && (
          <PricingTab creations={creations} initialPricings={initialPricings} />
        )}
        {tab === "library" && <LibraryTab />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 1 — Idea Analyzer                                               */
/* ------------------------------------------------------------------ */

function AnalyzerTab({
  creations,
  initialAnalyses,
}: {
  creations: Creation[];
  initialAnalyses: Record<string, IdeaAnalysis>;
}) {
  const [analyses, setAnalyses] =
    useState<Record<string, IdeaAnalysis>>(initialAnalyses);
  const [openId, setOpenId] = useState<string | null>(
    creations.find((c) => initialAnalyses[c.id])?.id ?? null
  );
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(creationId: string) {
    setRunningId(creationId);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalyses((prev) => ({ ...prev, [creationId]: data.analysis }));
      setOpenId(creationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRunningId(null);
    }
  }

  if (creations.length === 0) {
    return (
      <EmptyState
        title="No creations yet"
        body="Tell us about your AI creation and get an instant monetization analysis."
        cta={{ href: "/onboarding", label: "Analyze my first creation" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Your creations</h2>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 rounded-lg border border-night-600 bg-night-700 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-electric/50"
        >
          <Plus size={15} /> Add creation
        </Link>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {creations.map((creation) => {
        const analysis = analyses[creation.id];
        const isOpen = openId === creation.id;
        const isRunning = runningId === creation.id;

        return (
          <div
            key={creation.id}
            className="overflow-hidden rounded-2xl border border-night-600 bg-night-700"
          >
            <div className="flex flex-wrap items-center gap-3 p-4">
              {analysis ? (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-lg font-black gradient-text ring-2 ring-electric/40">
                  {Math.round(analysis.score)}
                </span>
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-night-800 text-slate-500 ring-2 ring-night-600">
                  <Lightbulb size={18} />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{creation.title}</p>
                <p className="text-xs capitalize text-slate-400">
                  {creation.type} ·{" "}
                  {new Date(creation.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {analysis && (
                  <button
                    onClick={() => setOpenId(isOpen ? null : creation.id)}
                    className="rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-electric/50"
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                )}
                <button
                  onClick={() => runAnalysis(creation.id)}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-electric px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {isRunning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : analysis ? (
                    <RefreshCw size={14} />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {analysis ? "Re-run" : "Analyze"}
                </button>
              </div>
            </div>

            {isOpen && analysis && (
              <div className="border-t border-night-600 bg-night-800/50 p-5">
                <AnalysisResult analysis={analysis} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Pricing & Packaging Builder                                 */
/* ------------------------------------------------------------------ */

function PricingTab({
  creations,
  initialPricings,
}: {
  creations: Creation[];
  initialPricings: Record<string, PricingRecommendation>;
}) {
  const [pricings, setPricings] =
    useState<Record<string, PricingRecommendation>>(initialPricings);
  const [selectedId, setSelectedId] = useState<string>(creations[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricing = selectedId ? pricings[selectedId] : undefined;

  async function generate() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pricing generation failed");
      setPricings((prev) => ({ ...prev, [selectedId]: data.pricing }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (creations.length === 0) {
    return (
      <EmptyState
        title="Add a creation first"
        body="The Pricing & Packaging Builder needs to know what you built."
        cta={{ href: "/onboarding", label: "Add my creation" }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-night-600 bg-night-700 p-5">
        <label
          htmlFor="pricing-creation"
          className="mb-1.5 block text-sm font-semibold text-slate-300"
        >
          Which creation do you want to price?
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <select
            id="pricing-creation"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="min-w-52 flex-1 rounded-xl border border-night-600 bg-night-800 px-4 py-2.5 text-white outline-none transition focus:border-electric"
          >
            {creations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-electric-bright px-5 py-2.5 font-semibold text-white shadow shadow-electric/25 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <BadgeDollarSign size={16} />
            )}
            {pricing ? "Regenerate pricing" : "Build my pricing"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {pricing ? (
        <PricingResult pricing={pricing} />
      ) : (
        !loading && (
          <p className="text-sm text-slate-400">
            Pick a creation and hit{" "}
            <span className="font-semibold text-white">Build my pricing</span> to
            get suggested price ranges, packaging models, and ready-to-use sales
            copy.
          </p>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 3 — Quick-Start Library                                         */
/* ------------------------------------------------------------------ */

function LibraryTab() {
  const [previewId, setPreviewId] = useState<string | null>(null);

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Battle-tested templates. Download, fill in the brackets, ship today.
      </p>
      {QUICK_START_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className="rounded-2xl border border-night-600 bg-night-700"
        >
          <div className="flex flex-wrap items-center gap-3 p-5">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white">{template.title}</h3>
              <p className="mt-0.5 text-sm text-slate-400">
                {template.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPreviewId(previewId === template.id ? null : template.id)
                }
                className="rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-electric/50"
              >
                {previewId === template.id ? "Hide" : "Preview"}
              </button>
              <button
                onClick={() => download(template.filename, template.content)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-electric px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>
          {previewId === template.id && (
            <pre className="max-h-96 overflow-auto border-t border-night-600 bg-night-800/70 p-5 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
              {template.content}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-night-600 bg-night-700/50 p-10 text-center">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">{body}</p>
      <Link
        href={cta.href}
        className="mt-5 inline-block rounded-xl bg-gradient-to-r from-electric to-electric-bright px-6 py-3 font-bold text-white shadow-lg shadow-electric/25 transition hover:brightness-110"
      >
        {cta.label}
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Locked tier cards (exported for the dashboard page)                 */
/* ------------------------------------------------------------------ */

export function LockedTierCards({ currentTier }: { currentTier: string | null }) {
  const sections = [
    {
      tier: "Growth",
      price: "$50/mo",
      unlocked: currentTier === "growth" || currentTier === "pro",
      tools: [
        {
          name: "Funnel Architect",
          blurb: "AI-guided tripwire → core offer → upsell funnels with copy for every stage.",
        },
        {
          name: "Ad & Content Generator",
          blurb: "One idea → LinkedIn posts, ad variations, marketplace listings, email sequences.",
        },
        {
          name: "Progress Tracker",
          blurb: "See exactly how many assets you have ready and your path to first revenue.",
        },
      ],
    },
    {
      tier: "Pro",
      price: "$100/mo",
      unlocked: currentTier === "pro",
      tools: [
        {
          name: "Advanced Strategy Tools",
          blurb: "Competitor analysis, pricing optimization, and a custom 30/60/90-day roadmap.",
        },
        {
          name: "Done-For-You Elements",
          blurb: "One custom high-converting asset per month, reviewed and refined for you.",
        },
        {
          name: "Priority Support + Premium Library",
          blurb: "Faster responses and Kennedy-style swipe files the pros actually use.",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.tier}>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              {section.tier} tools
            </h3>
            <span className="rounded-full bg-night-600 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
              {section.price}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {section.tools.map((tool) => (
              <div
                key={tool.name}
                className="relative overflow-hidden rounded-2xl border border-night-600 bg-night-700/60 p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-200">{tool.name}</h4>
                  {!section.unlocked && (
                    <Lock size={15} className="shrink-0 text-gold" />
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {tool.blurb}
                </p>
                {section.unlocked ? (
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Included in your plan — coming soon
                  </p>
                ) : (
                  <Link
                    href="/pricing"
                    className="mt-4 inline-block rounded-lg bg-gradient-to-r from-gold to-gold-bright px-4 py-2 text-xs font-bold text-night transition hover:brightness-110"
                  >
                    Unlock with {section.tier} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
