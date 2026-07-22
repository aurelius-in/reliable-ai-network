"use client";

import { useEffect, useState } from "react";
import {
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
import { LockedPreview } from "@/components/ui";
import { hasTierAccess, type TierName } from "@/lib/tiers";
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

type TabId =
  | "analyzer"
  | "buyers"
  | "pricing"
  | "library"
  | "funnel"
  | "traffic"
  | "launch"
  | "content"
  | "progress"
  | "strategy"
  | "sales"
  | "results"
  | "revenue"
  | "dfy"
  | "premium";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  tier: TierName;
}

const TABS: TabDef[] = [
  { id: "analyzer", label: "Idea Analyzer", icon: <Lightbulb size={16} />, tier: "starter" },
  { id: "buyers", label: "Find Your Buyers", icon: <Users size={16} />, tier: "starter" },
  { id: "pricing", label: "Pricing Builder", icon: <BadgeDollarSign size={16} />, tier: "starter" },
  { id: "library", label: "Quick-Start Library", icon: <BookOpen size={16} />, tier: "starter" },
  { id: "funnel", label: "Funnel Architect", icon: <GitBranch size={16} />, tier: "growth" },
  { id: "traffic", label: "Get Eyes on Your Offer", icon: <Eye size={16} />, tier: "growth" },
  { id: "launch", label: "30-Day Launch Plan", icon: <Rocket size={16} />, tier: "growth" },
  { id: "content", label: "Content Generator", icon: <Megaphone size={16} />, tier: "growth" },
  { id: "progress", label: "Progress Tracker", icon: <ListChecks size={16} />, tier: "growth" },
  { id: "strategy", label: "Strategy Tools", icon: <Brain size={16} />, tier: "pro" },
  { id: "sales", label: "Direct Sales Tools", icon: <Handshake size={16} />, tier: "pro" },
  { id: "results", label: "What's Working", icon: <TrendingUp size={16} />, tier: "pro" },
  { id: "revenue", label: "Ways to Get Paid", icon: <Layers size={16} />, tier: "pro" },
  { id: "dfy", label: "Done-For-You", icon: <Gift size={16} />, tier: "pro" },
  { id: "premium", label: "Premium Library", icon: <Crown size={16} />, tier: "pro" },
];

const TIER_GROUPS: { tier: TierName; label: string; price: string }[] = [
  { tier: "starter", label: "Starter", price: "$20/mo" },
  { tier: "growth", label: "Growth", price: "$50/mo" },
  { tier: "pro", label: "Pro", price: "$100/mo" },
];

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
  // Mobile bottom-sheet tool picker (opened from the bottom tab bar).
  const [sheetOpen, setSheetOpen] = useState(false);

  function selectTab(next: TabId) {
    setTab(next);
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
        setTab("progress");
        setSheetOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (section === "home") {
        setSheetOpen(false);
        setTab((current) => (current === "progress" ? "analyzer" : current));
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

  const activeDef = TABS.find((t) => t.id === tab)!;
  const activeUnlocked = isUnlocked(activeDef.tier);

  return (
    <div>
      {/* Phones: compact current-tool header that opens the tool sheet. */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-night-600 bg-night-700 px-4 py-3.5 transition active:scale-[0.98] md:hidden"
      >
        <span className="flex min-w-0 items-center gap-2.5 text-sm font-bold text-white">
          <span className="text-rain-bright">{activeDef.icon}</span>
          <span className="truncate">{activeDef.label}</span>
          {!activeUnlocked && <Lock size={12} className="shrink-0 text-slate-500" />}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-rain-bright">
          All tools <ChevronDown size={14} />
        </span>
      </button>

      {/* Mobile tool sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSheetOpen(false)}
          />
          <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-3xl border-t border-night-600 bg-night-800 px-5 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-night-600" />
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">All tools</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-night-700 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
            {TIER_GROUPS.map((group) => {
              const groupUnlocked = isUnlocked(group.tier);
              return (
                <div key={group.tier} className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-black uppercase tracking-widest ${
                        group.tier === "pro"
                          ? "text-violet-bright"
                          : group.tier === "growth"
                            ? "text-rain-bright"
                            : "text-slate-400"
                      }`}
                    >
                      {group.label}
                    </span>
                    <span className="rounded-full bg-night-700 px-2 py-0.5 text-[10px] font-bold text-slate-400 ring-1 ring-night-600">
                      {group.price}
                    </span>
                    {!groupUnlocked && <Lock size={11} className="text-slate-500" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {TABS.filter((t) => t.tier === group.tier).map((t) => {
                      const active = tab === t.id;
                      const unlocked = isUnlocked(t.tier);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => selectTab(t.id)}
                          className={`flex min-h-[52px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[13px] font-semibold transition active:scale-[0.97] ${
                            active
                              ? "border-rain bg-rain/15 text-white shadow-[0_0_14px_rgba(226,0,116,0.25)]"
                              : unlocked
                                ? "border-night-600 bg-night-700 text-slate-300"
                                : "border-night-600 bg-night-700/50 text-slate-500"
                          }`}
                        >
                          <span className={active ? "text-rain-bright" : ""}>
                            {t.icon}
                          </span>
                          <span className="min-w-0 flex-1 leading-tight">
                            {t.label}
                          </span>
                          {!unlocked && (
                            <Lock size={12} className="shrink-0 opacity-70" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab bar, grouped by tier — desktop/tablet only */}
      <div className="hidden md:flex md:flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:gap-6">
        {TIER_GROUPS.map((group) => {
          const groupUnlocked = isUnlocked(group.tier);
          return (
            <div key={group.tier} className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`text-[11px] font-black uppercase tracking-widest ${
                    group.tier === "pro"
                      ? "text-violet-bright"
                      : group.tier === "growth"
                        ? "text-rain-bright"
                        : "text-slate-400"
                  }`}
                >
                  {group.label}
                </span>
                <span className="rounded-full bg-night-700 px-2 py-0.5 text-[10px] font-bold text-slate-400 ring-1 ring-night-600">
                  {group.price}
                </span>
                {!groupUnlocked && (
                  <Lock size={11} className="text-slate-500" />
                )}
              </div>
              {/* Phones: horizontal scroll strip (full-bleed so the cut-off
                  next chip + thin scrollbar signal overflow). Desktop: wrap. */}
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-x-visible lg:px-0 lg:pb-0">
                {TABS.filter((t) => t.tier === group.tier).map((t) => {
                  const active = tab === t.id;
                  const unlocked = isUnlocked(t.tier);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-aqua via-violet to-rain text-white shadow-lg shadow-aqua/25"
                          : unlocked
                            ? "border border-night-600 bg-night-700 text-slate-300 hover:border-rain/50 hover:text-white"
                            : "border border-night-600 bg-night-700/50 text-slate-500 hover:border-violet/40 hover:text-slate-300"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                      {!unlocked && <Lock size={12} className="opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7">
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
