"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  Brain,
  ChevronDown,
  Crown,
  Eye,
  GitBranch,
  Gift,
  Handshake,
  Layers,
  Lightbulb,
  ListChecks,
  Lock,
  Megaphone,
  Rocket,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { MOBILE_NAV_EVENT, TAB_CHANGE_EVENT } from "@/components/MobileTabBar";
import { AnalyzerTab } from "@/components/tabs/AnalyzerTab";
import { BuyersTab } from "@/components/tabs/BuyersTab";
import { PricingTab } from "@/components/tabs/PricingTab";
import { LibraryTab } from "@/components/tabs/LibraryTab";
import { FunnelTab } from "@/components/tabs/FunnelTab";
import { TrafficTab } from "@/components/tabs/TrafficTab";
import { LaunchTab } from "@/components/tabs/LaunchTab";
import { ContentTab } from "@/components/tabs/ContentTab";
import { ProgressTab } from "@/components/tabs/ProgressTab";
import { StrategyTab } from "@/components/tabs/StrategyTab";
import { SalesTab } from "@/components/tabs/SalesTab";
import { ResultsTab } from "@/components/tabs/ResultsTab";
import { RevenueTab } from "@/components/tabs/RevenueTab";
import { DfyTab } from "@/components/tabs/DfyTab";
import { PremiumTab } from "@/components/tabs/PremiumTab";
import { JourneyPie } from "@/components/JourneyPie";
import { NextBestActionCard } from "@/components/NextBestAction";
import { LockedPreview } from "@/components/ui";
import { hasTierAccess, type TierName } from "@/lib/tiers";
import {
  adjacentStep,
  countCompleted,
  getNextBestAction,
  getSliceCompletion,
  JOURNEY_STEPS,
  loadVisitedSteps,
  markStepVisited,
  type JourneyTabId,
} from "@/lib/journey";
import { trackToolView, trackUiClick } from "@/lib/track";
import type {
  BuyerProfilesResult,
  ContentBundle,
  Creation,
  FunnelPlan,
  GeneratedAsset,
  IdeaAnalysis,
  LaunchPlan,
  MetricsAnalysis,
  MetricsEntry,
  PricingRecommendation,
  RevenueStreamsPlan,
  SalesKit,
  StrategyResults,
  TrafficPlan,
} from "@/types";

type TabId = JourneyTabId;

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  tier: TierName;
}

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  analyzer: <Lightbulb size={16} />,
  buyers: <Users size={16} />,
  pricing: <BadgeDollarSign size={16} />,
  library: <BookOpen size={16} />,
  funnel: <GitBranch size={16} />,
  traffic: <Eye size={16} />,
  launch: <Rocket size={16} />,
  content: <Megaphone size={16} />,
  progress: <ListChecks size={16} />,
  strategy: <Brain size={16} />,
  sales: <Handshake size={16} />,
  results: <TrendingUp size={16} />,
  revenue: <Layers size={16} />,
  dfy: <Gift size={16} />,
  premium: <Crown size={16} />,
};

const TABS: TabDef[] = JOURNEY_STEPS.map((step) => ({
  id: step.id,
  label: step.label,
  icon: TAB_ICONS[step.id],
  tier: step.tier,
}));

const LOCKED_COPY: Record<
  TabId,
  { toolName: string; tagline: string; previews: string[] }
> = {
  analyzer: { toolName: "", tagline: "", previews: [] },
  buyers: { toolName: "", tagline: "", previews: [] },
  pricing: { toolName: "", tagline: "", previews: [] },
  library: { toolName: "", tagline: "", previews: [] },
  traffic: {
    toolName: "Demand Channels",
    tagline:
      "Ranked acquisition channels for your product, with effort vs. payoff, sample outreach, and a weekly execution plan sized to your capacity.",
    previews: [
      "Channels scored by effort vs. expected signal",
      "Draft posts or messages per channel",
      "Weekly plan matched to available hours",
      "Fits founder-led or lean team motions",
    ],
  },
  launch: {
    toolName: "30-Day Launch Plan",
    tagline:
      "Day-by-day launch calendar: one concrete action per day, draft assets inline, and checkpoints to know if the motion is working.",
    previews: [
      "30 days with one primary action each day",
      "Draft posts, emails, and outreach inline",
      "Milestone targets you can measure",
      "Contingency path if early metrics are weak",
    ],
  },
  sales: {
    toolName: "DM Writer",
    tagline:
      "Openers, follow-ups, and objection replies personalized to your product and each recipient type — short, human, one ask.",
    previews: [
      "Openers customized to product + recipient",
      "Multi-touch follow-ups that stay peer-tone",
      "Replies for price and timing objections",
      "15-minute discovery agenda",
    ],
  },
  results: {
    toolName: "Performance Review",
    tagline:
      "Log weekly funnel numbers and get a clear bottleneck diagnosis: where you are leaking, and what to test next.",
    previews: [
      "Weekly log: traffic, signups, closes, revenue",
      "Trend view of the funnel",
      "Bottleneck call with rationale",
      "Two to three tests for the next week",
    ],
  },
  revenue: {
    toolName: "Revenue Model Design",
    tagline:
      "Compare subscription, usage, hybrid, and services models for your product with tradeoffs and a recommended first build.",
    previews: [
      "Models matched to your buyer and delivery cost",
      "Pros, cons, and implementation effort",
      "Order-of-magnitude unit economics",
      "Clear 'build this first' recommendation",
    ],
  },
  funnel: {
    toolName: "Funnel Architect",
    tagline:
      "Entry offer, core product, and expansion path with messaging for each stage and a map of how buyers should move through.",
    previews: [
      "Entry → core → expansion, fully drafted",
      "Stage map you can operationalize",
      "Headline, pitch, and proof points per stage",
      "Conversion notes grounded in B2B motions",
    ],
  },
  content: {
    toolName: "Post, Newsletter & Ad Poster",
    tagline:
      "Network-native posts and emails personalized to your product, plus ad posters sized for LinkedIn, Meta, X, YouTube, TikTok, Reddit, Google Ads, and more.",
    previews: [
      "Pick the networks you already use (organic + paid)",
      "Posts and captions tailored per network",
      "Ad posters for Feed, Stories, Shorts, Display",
      "Newsletter sequence that feels 1:1",
    ],
  },
  progress: {
    toolName: "Execution Tracker",
    tagline:
      "Track monetization milestones and illustrative plays you can adapt to your motion.",
    previews: [
      "Milestones from first offer to first revenue",
      "Count of assets generated in-workspace",
      "Illustrative plays (not claimed customer results)",
      "Progress against the commercialization path",
    ],
  },
  strategy: {
    toolName: "Advanced Strategy Tools",
    tagline:
      "Competitor structure, pricing experiments, 90-day plan, and test backlog grounded in your product description.",
    previews: [
      "Competitor map with edges to validate",
      "Pricing experiments with success criteria",
      "30/60/90 monetization roadmap",
      "Tests ranked by speed of learning",
    ],
  },
  dfy: {
    toolName: "Done-For-You",
    tagline:
      "Once a month, request one custom commercial asset. Queued delivery, not instant generation.",
    previews: [
      "Offer pages, ad sets, sequences, and more",
      "Brief → queued request (human delivery)",
      "Visible queue status",
      "One custom asset request per month",
    ],
  },
  premium: {
    toolName: "Premium Library + Priority Support",
    tagline:
      "Kennedy-style swipe files behind millions in sales, plus a support lane where your questions jump the queue.",
    previews: [
      "Direct-response sales letter & VSL script swipes",
      "Price-raise and win-back sequences",
      "7-day launch checklist",
      "Human answers to your questions in under 24h",
    ],
  },
};

export interface DashboardData {
  creations: Creation[];
  initialAnalyses: Record<string, IdeaAnalysis>;
  initialPricings: Record<string, PricingRecommendation>;
  initialBuyers: BuyerProfilesResult | null;
  initialFunnel: FunnelPlan | null;
  initialTraffic: TrafficPlan | null;
  initialLaunch: LaunchPlan | null;
  initialBundle: ContentBundle | null;
  initialStrategy: StrategyResults;
  initialSalesKit: SalesKit | null;
  initialRevenue: RevenueStreamsPlan | null;
  metricsEntries: MetricsEntry[];
  initialMetricsAnalysis: MetricsAnalysis | null;
  initialProgress: Record<string, boolean>;
  assetStats: { total: number; byLabel: { label: string; count: number }[] };
  dfyRequests: GeneratedAsset[];
}

export function DashboardTabs({
  currentTier,
  data,
}: {
  currentTier: string | null;
  data: DashboardData;
}) {
  const [tab, setTab] = useState<TabId>("analyzer");
  // Mobile bottom-sheet journey picker (opened from the bottom tab bar).
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visited, setVisited] = useState<Set<JourneyTabId>>(() => new Set());

  useEffect(() => {
    setVisited(loadVisitedSteps());
    const step = JOURNEY_STEPS.find((s) => s.id === "analyzer");
    trackToolView("analyzer", step?.label);
  }, []);

  function selectTab(next: TabId) {
    if (next !== tab) {
      const step = JOURNEY_STEPS.find((s) => s.id === next);
      trackToolView(next, step?.label);
    }
    setTab(next);
    setVisited(markStepVisited(next));
    setSheetOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Wire up the mobile bottom tab bar (Home / Tools / Progress).
  useEffect(() => {
    function onNav(e: Event) {
      const section = (e as CustomEvent).detail?.section;
      if (section === "tools") {
        setSheetOpen((open) => !open);
      } else if (section === "progress") {
        selectTab("progress");
      } else if (section === "home") {
        setSheetOpen(false);
        setTab((current) => {
          const next = current === "progress" ? "analyzer" : current;
          return next;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    window.addEventListener(MOBILE_NAV_EVENT, onNav);
    return () => window.removeEventListener(MOBILE_NAV_EVENT, onNav);
  }, []);

  // Deep link from other pages, e.g. /dashboard?view=tools or ?tab=buyers.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const tabParam = params.get("tab");
    if (view === "tools") setSheetOpen(true);
    else if (view === "progress") setTab("progress");
    const allowedTabs: TabId[] = [
      "buyers",
      "analyzer",
      "pricing",
      "progress",
    ];
    if (tabParam && (allowedTabs as string[]).includes(tabParam)) {
      setTab(tabParam as TabId);
    }
    if (view || tabParam) window.history.replaceState(null, "", "/dashboard");
  }, []);

  // Keep the bottom bar's active state in sync.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(TAB_CHANGE_EVENT, { detail: { tab, sheetOpen } })
    );
  }, [tab, sheetOpen]);

  // Lock body scroll while the tool sheet is open.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  // Starter tools are always usable — even before a subscription exists —
  // so brand-new users get value immediately.
  const isUnlocked = (tier: TierName) =>
    tier === "starter" || hasTierAccess(currentTier, tier);

  const completion = useMemo(
    () => getSliceCompletion(data, visited),
    [data, visited]
  );
  const doneCount = countCompleted(completion);
  const pieComplete = doneCount === JOURNEY_STEPS.length;
  const nextAction = useMemo(
    () => getNextBestAction(completion, isUnlocked),
    // isUnlocked closes over currentTier; depend on that instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completion, currentTier]
  );

  const activeDef = TABS.find((t) => t.id === tab)!;
  const activeUnlocked = isUnlocked(activeDef.tier);
  const prevStep = adjacentStep(tab, -1);
  const nextStep = adjacentStep(tab, 1);
  // Catch-up strip only when unfinished work isn’t the linear “Next step”
  // (avoids two CTAs pointing at the same slice).
  const showNbaBanner =
    pieComplete ||
    (tab !== nextAction.step.id && nextAction.step.id !== nextStep?.id);

  function goNextBest() {
    if (nextAction.locked) {
      trackUiClick("nba_upgrade", { tool: nextAction.step.id });
      window.location.href = "/billing";
      return;
    }
    trackUiClick("nba_continue", { tool: nextAction.step.id });
    selectTab(nextAction.step.id);
  }

  const pieBlock = (compact: boolean) => (
    <JourneyPie
      activeId={tab}
      nextId={nextAction.step.id}
      completion={completion}
      isUnlocked={(id) => {
        const step = JOURNEY_STEPS.find((s) => s.id === id)!;
        return isUnlocked(step.tier);
      }}
      onSelect={selectTab}
      doneCount={doneCount}
      compact={compact}
    />
  );

  return (
    <div>
      {/* Commercialization path */}
      <div className="space-y-4">
        {/* Desktop / tablet pie */}
        <div className="hidden md:block">
          <div className="card-glow overflow-hidden p-5 lg:p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Commercialization path
              </p>
              <p className="max-w-md text-sm text-slate-300">
                Work each stage in order. When the path is complete, you have a
                documented go-to-market system you can run and revise.
              </p>
            </div>
            <div className="mt-4 flex justify-center">{pieBlock(false)}</div>
          </div>
        </div>

        {/* Phones: compact current-step chip that opens the pie sheet */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-night-600 bg-night-700 px-4 py-3.5 transition active:scale-[0.98] md:hidden"
        >
          <span className="flex min-w-0 items-center gap-2.5 text-sm font-bold text-white">
            <span className="text-rain-bright">{activeDef.icon}</span>
            <span className="truncate">{activeDef.label}</span>
            {!activeUnlocked && (
              <Lock size={12} className="shrink-0 text-slate-500" />
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-rain-bright">
            Pie {doneCount}/15 <ChevronDown size={14} />
          </span>
        </button>
      </div>

      {/* Primary: linear next step (the path) */}
      <div className="mt-5 flex items-stretch gap-2 sm:gap-3">
        <button
          type="button"
          disabled={!prevStep}
          onClick={() => {
            if (!prevStep) return;
            trackUiClick("path_back", { tool: prevStep.id });
            selectTab(prevStep.id);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-night-600 bg-night-700 px-3.5 py-3 text-sm font-semibold text-slate-300 transition enabled:hover:border-rain/50 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button
          type="button"
          disabled={!nextStep}
          onClick={() => {
            if (!nextStep) return;
            trackUiClick("path_next", { tool: nextStep.id });
            selectTab(nextStep.id);
          }}
          className="group relative flex min-w-0 flex-1 items-center justify-between gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-aqua via-violet to-rain px-4 py-3 text-left text-white shadow-lg shadow-aqua/20 transition enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:px-5"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
              Next step
            </span>
            <span className="mt-0.5 block truncate text-sm font-bold sm:text-base">
              {nextStep ? nextStep.label : "End of the path"}
            </span>
          </span>
          <ArrowRight
            size={18}
            className="shrink-0 transition group-enabled:group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Secondary: unfinished slices (not the main “next”) */}
      {showNbaBanner && (
        <div className="mt-3">
          <NextBestActionCard
            action={nextAction}
            completion={completion}
            onGo={goNextBest}
            pieComplete={pieComplete}
          />
        </div>
      )}

      {/* Mobile journey sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSheetOpen(false)}
          />
          <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-night-600 bg-night-800 px-5 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-night-600" />
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Your pie</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-night-700 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Tap a slice to jump. Use Next step to stay in order.
            </p>
            <div className="mt-4 flex justify-center">{pieBlock(true)}</div>
            <div className="mt-5 space-y-1.5">
              {JOURNEY_STEPS.map((step, i) => {
                const active = tab === step.id;
                const unlocked = isUnlocked(step.tier);
                const done = completion[step.id];
                const isNext = step.id === nextAction.step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => selectTab(step.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition active:scale-[0.98] ${
                      active
                        ? "border-rain bg-rain/15 text-white"
                        : isNext
                          ? "border-aqua/50 bg-aqua/10 text-white"
                          : unlocked
                            ? "border-night-600 bg-night-700 text-slate-300"
                            : "border-night-600 bg-night-700/50 text-slate-500"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        done
                          ? "bg-aqua/20 text-aqua-bright"
                          : "bg-night-800 text-slate-400"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold leading-tight">
                      {step.label}
                    </span>
                    {!unlocked && (
                      <Lock size={12} className="shrink-0 opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 fade-up">
        {!activeUnlocked ? (
          <LockedPreview
            tier={activeDef.tier === "pro" ? "Pro" : "Growth"}
            price={activeDef.tier === "pro" ? "$149/mo" : "$79/mo"}
            toolName={LOCKED_COPY[tab].toolName}
            tagline={LOCKED_COPY[tab].tagline}
            previews={LOCKED_COPY[tab].previews}
          />
        ) : (
          <>
            {tab === "analyzer" && (
              <AnalyzerTab
                creations={data.creations}
                initialAnalyses={data.initialAnalyses}
                onJumpTab={(id) => selectTab(id as TabId)}
              />
            )}
            {tab === "pricing" && (
              <PricingTab
                creations={data.creations}
                initialPricings={data.initialPricings}
              />
            )}
            {tab === "buyers" && (
              <BuyersTab
                creations={data.creations}
                initialResult={data.initialBuyers}
                initialAnalyses={data.initialAnalyses}
              />
            )}
            {tab === "library" && (
              <LibraryTab
                creations={data.creations}
                initialAnalyses={data.initialAnalyses}
                initialBuyers={data.initialBuyers}
                initialPricings={data.initialPricings}
              />
            )}
            {tab === "funnel" && (
              <FunnelTab
                creations={data.creations}
                initialFunnel={data.initialFunnel}
                initialBuyers={data.initialBuyers}
                onJumpTab={(id) => selectTab(id as TabId)}
              />
            )}
            {tab === "traffic" && (
              <TrafficTab
                creations={data.creations}
                initialPlan={data.initialTraffic}
                initialBuyers={data.initialBuyers}
                onJumpTab={(id) => selectTab(id as TabId)}
              />
            )}
            {tab === "launch" && (
              <LaunchTab
                creations={data.creations}
                initialPlan={data.initialLaunch}
              />
            )}
            {tab === "content" && (
              <ContentTab
                creations={data.creations}
                initialBundle={data.initialBundle}
                initialAnalyses={data.initialAnalyses}
                initialBuyers={data.initialBuyers}
              />
            )}
            {tab === "progress" && (
              <ProgressTab
                initialProgress={data.initialProgress}
                assetStats={data.assetStats}
                onJumpTab={(id) => selectTab(id as TabId)}
                initialRevenue={data.initialRevenue}
                initialFunnel={data.initialFunnel}
                initialAnalyses={data.initialAnalyses}
              />
            )}
            {tab === "strategy" && (
              <StrategyTab
                creations={data.creations}
                initialResults={data.initialStrategy}
              />
            )}
            {tab === "sales" && (
              <SalesTab
                creations={data.creations}
                initialKit={data.initialSalesKit}
                initialBuyers={data.initialBuyers}
              />
            )}
            {tab === "results" && (
              <ResultsTab
                creations={data.creations}
                initialEntries={data.metricsEntries}
                initialAnalysis={data.initialMetricsAnalysis}
                onJumpTab={(id) => selectTab(id as TabId)}
              />
            )}
            {tab === "revenue" && (
              <RevenueTab
                creations={data.creations}
                initialPlan={data.initialRevenue}
                onJumpTab={(id) => selectTab(id as TabId)}
              />
            )}
            {tab === "dfy" && (
              <DfyTab
                initialRequests={data.dfyRequests}
                creations={data.creations}
                initialBuyers={data.initialBuyers}
                initialPricings={data.initialPricings}
              />
            )}
            {tab === "premium" && (
              <PremiumTab
                creations={data.creations}
                initialAnalyses={data.initialAnalyses}
                initialBuyers={data.initialBuyers}
                initialPricings={data.initialPricings}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
