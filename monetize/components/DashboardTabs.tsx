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
import { BrandSplash } from "@/components/BrandSplash";
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
    toolName: "Get Eyes on Your Offer",
    tagline:
      "The 5-7 best places to promote YOUR product — scored by effort vs. payoff, with a ready-to-paste post for each and a weekly plan that fits your life.",
    previews: [
      "Channels ranked by effort vs. results, visually",
      "A ready-to-publish post for every channel",
      "A weekly traffic plan sized to your free hours",
      "Respects your style — camera-shy friendly",
    ],
  },
  launch: {
    toolName: "30-Day Launch Plan",
    tagline:
      "A day-by-day calendar from zero to launched: one clear action per day, posts and emails pre-written, and checkpoints so you always know you're on track.",
    previews: [
      "30 days, one doable action per day",
      "Pre-written posts, emails & DMs inline",
      "Milestones like '50 signups by day 10'",
      "A 'results are weak — do this' backup plan",
    ],
  },
  sales: {
    toolName: "Direct Sales Tools",
    tagline:
      "Word-for-word cold DMs, emails, and follow-ups personalized to your product — plus objection answers and a simple call plan. Selling without the sleaze.",
    previews: [
      "3 opener messages with different angles",
      "A 3-5 touch follow-up sequence that isn't pushy",
      "Scripts for 'too expensive' and 'let me think'",
      "A 15-minute call agenda anyone can run",
    ],
  },
  results: {
    toolName: "What's Working",
    tagline:
      "Log four simple numbers a week and let AI find your bottleneck: what's working, what's leaking money, and exactly what to test next week.",
    previews: [
      "One-tap weekly logging — visitors, signups, sales, $",
      "A clean trend chart of your growth",
      "AI pinpoints the stage losing you money",
      "2-3 concrete tests to run next week",
    ],
  },
  revenue: {
    toolName: "Multiple Ways to Get Paid",
    tagline:
      "Subscriptions? One-time? Freemium? Services? See every revenue model that fits your product, compared side by side — with a clear 'build this first' verdict.",
    previews: [
      "3-5 revenue models matched to your product",
      "Honest pros, cons & effort for each",
      "Realistic math like '$9/mo × 100 = $900/mo'",
      "A prioritized 'build this first' pick",
    ],
  },
  funnel: {
    toolName: "Funnel Architect",
    tagline:
      "A cheap first offer, your core product, and a premium upsell — designed and written for you, with a visual map of how buyers flow through.",
    previews: [
      "Tripwire → core offer → profit maximizer, fully written",
      "A visual funnel diagram you can follow step by step",
      "Sales headline, pitch, and bullets for every stage",
      "Conversion tips a funnel pro would charge for",
    ],
  },
  content: {
    toolName: "Ad & Content Generator",
    tagline:
      "Turn one idea into a whole launch: social posts, ads, a marketplace listing, and an email sequence — in one tap.",
    previews: [
      "LinkedIn + X posts with scroll-stopping hooks",
      "3 ad variations testing different angles",
      "A ready-to-paste Gumroad / App Store listing",
      "A 3-email sequence that closes sales",
    ],
  },
  progress: {
    toolName: "Progress Tracker + Success Wall",
    tagline:
      "See exactly where you are on the road to first revenue — and what creators like you did to get there.",
    previews: [
      "A milestone checklist from first idea to first $100",
      "Live count of every asset you've generated",
      "A wall of real community wins to steal ideas from",
      "Progress bar that makes momentum visible",
    ],
  },
  strategy: {
    toolName: "Advanced Strategy Tools",
    tagline:
      "The analysis a strategy consultant would bill thousands for: competitors, pricing, a 90-day plan, and experiments to run.",
    previews: [
      "Competitor scan with your unfair edge",
      "Pricing optimization with concrete experiments",
      "A custom 30/60/90-day monetization roadmap",
      "A/B test ideas ranked easiest-first",
    ],
  },
  dfy: {
    toolName: "Done-For-You",
    tagline:
      "Once a month, our team crafts one custom high-converting asset for your product — you just tap what you want.",
    previews: [
      "Offer pages, ad sets, email sequences & more",
      "Built by AI + human review, tailored to your product",
      "Simple queue so you always know the status",
      "One custom asset included every month",
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
  const [splashKey, setSplashKey] = useState("boot");
  const [visited, setVisited] = useState<Set<JourneyTabId>>(() => new Set());

  useEffect(() => {
    setVisited(loadVisitedSteps());
  }, []);

  function selectTab(next: TabId) {
    if (next !== tab) {
      setSplashKey(`${next}-${Date.now()}`);
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
          if (next !== current) {
            setSplashKey(`${next}-${Date.now()}`);
          }
          return next;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    window.addEventListener(MOBILE_NAV_EVENT, onNav);
    return () => window.removeEventListener(MOBILE_NAV_EVENT, onNav);
  }, []);

  // Deep link from other pages, e.g. /dashboard?view=tools from Billing.
  useEffect(() => {
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "tools") setSheetOpen(true);
    else if (view === "progress") setTab("progress");
    if (view) window.history.replaceState(null, "", "/dashboard");
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
  // Pulse the card when the user is off-path; hide while they work the suggested slice.
  const showNbaBanner = tab !== nextAction.step.id || pieComplete;

  function goNextBest() {
    if (nextAction.locked) {
      window.location.href = "/billing";
      return;
    }
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
      <BrandSplash triggerKey={splashKey} />

      {/* Story header: next action + pie path */}
      <div className="space-y-4">
        {showNbaBanner && (
          <NextBestActionCard
            action={nextAction}
            completion={completion}
            onGo={goNextBest}
            pieComplete={pieComplete}
          />
        )}

        {/* Desktop / tablet pie */}
        <div className="hidden md:block">
          <div className="card-glow overflow-hidden p-5 lg:p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Your monetization pie
              </p>
              <p className="max-w-md text-sm text-slate-300">
                Complete each slice in order. When the pie is full, you&apos;ve
                built the path to revenue — then you get to eat.
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
              Tap a slice to jump. Follow the pulse for the next best move.
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

      {/* Linear path controls */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!prevStep}
          onClick={() => prevStep && selectTab(prevStep.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-night-600 bg-night-700 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition enabled:hover:border-rain/50 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Stay on the path
        </p>
        <button
          type="button"
          disabled={!nextStep}
          onClick={() => nextStep && selectTab(nextStep.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-night-600 bg-night-700 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition enabled:hover:border-aqua/50 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-5 fade-up">
        {!activeUnlocked ? (
          <LockedPreview
            tier={activeDef.tier === "pro" ? "Pro" : "Growth"}
            price={activeDef.tier === "pro" ? "$100/mo" : "$50/mo"}
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
              />
            )}
            {tab === "library" && <LibraryTab />}
            {tab === "funnel" && (
              <FunnelTab
                creations={data.creations}
                initialFunnel={data.initialFunnel}
              />
            )}
            {tab === "traffic" && (
              <TrafficTab
                creations={data.creations}
                initialPlan={data.initialTraffic}
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
              />
            )}
            {tab === "progress" && (
              <ProgressTab
                initialProgress={data.initialProgress}
                assetStats={data.assetStats}
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
              />
            )}
            {tab === "results" && (
              <ResultsTab
                creations={data.creations}
                initialEntries={data.metricsEntries}
                initialAnalysis={data.initialMetricsAnalysis}
              />
            )}
            {tab === "revenue" && (
              <RevenueTab
                creations={data.creations}
                initialPlan={data.initialRevenue}
              />
            )}
            {tab === "dfy" && <DfyTab initialRequests={data.dfyRequests} />}
            {tab === "premium" && <PremiumTab />}
          </>
        )}
      </div>
    </div>
  );
}
