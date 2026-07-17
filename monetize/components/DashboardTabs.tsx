"use client";

import { useState } from "react";
import {
  BadgeDollarSign,
  BookOpen,
  Brain,
  Crown,
  GitBranch,
  Gift,
  Lightbulb,
  ListChecks,
  Lock,
  Megaphone,
} from "lucide-react";
import { AnalyzerTab } from "@/components/tabs/AnalyzerTab";
import { PricingTab } from "@/components/tabs/PricingTab";
import { LibraryTab } from "@/components/tabs/LibraryTab";
import { FunnelTab } from "@/components/tabs/FunnelTab";
import { ContentTab } from "@/components/tabs/ContentTab";
import { ProgressTab } from "@/components/tabs/ProgressTab";
import { StrategyTab } from "@/components/tabs/StrategyTab";
import { DfyTab } from "@/components/tabs/DfyTab";
import { PremiumTab } from "@/components/tabs/PremiumTab";
import { LockedPreview } from "@/components/ui";
import { hasTierAccess, type TierName } from "@/lib/tiers";
import type {
  ContentBundle,
  Creation,
  FunnelPlan,
  GeneratedAsset,
  IdeaAnalysis,
  PricingRecommendation,
  StrategyResults,
} from "@/types";

type TabId =
  | "analyzer"
  | "pricing"
  | "library"
  | "funnel"
  | "content"
  | "progress"
  | "strategy"
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
  { id: "pricing", label: "Pricing Builder", icon: <BadgeDollarSign size={16} />, tier: "starter" },
  { id: "library", label: "Quick-Start Library", icon: <BookOpen size={16} />, tier: "starter" },
  { id: "funnel", label: "Funnel Architect", icon: <GitBranch size={16} />, tier: "growth" },
  { id: "content", label: "Content Generator", icon: <Megaphone size={16} />, tier: "growth" },
  { id: "progress", label: "Progress Tracker", icon: <ListChecks size={16} />, tier: "growth" },
  { id: "strategy", label: "Strategy Tools", icon: <Brain size={16} />, tier: "pro" },
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
  pricing: { toolName: "", tagline: "", previews: [] },
  library: { toolName: "", tagline: "", previews: [] },
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
  initialFunnel: FunnelPlan | null;
  initialBundle: ContentBundle | null;
  initialStrategy: StrategyResults;
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

  // Starter tools are always usable — even before a subscription exists —
  // so brand-new users get value immediately.
  const isUnlocked = (tier: TierName) =>
    tier === "starter" || hasTierAccess(currentTier, tier);

  const activeDef = TABS.find((t) => t.id === tab)!;
  const activeUnlocked = isUnlocked(activeDef.tier);

  return (
    <div>
      {/* Tab bar, grouped by tier */}
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:gap-6">
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
              <div className="flex flex-wrap gap-2">
                {TABS.filter((t) => t.tier === group.tier).map((t) => {
                  const active = tab === t.id;
                  const unlocked = isUnlocked(t.tier);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-rain to-rain-bright text-white shadow-lg shadow-rain/30"
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
            {tab === "library" && <LibraryTab />}
            {tab === "funnel" && (
              <FunnelTab
                creations={data.creations}
                initialFunnel={data.initialFunnel}
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
            {tab === "dfy" && <DfyTab initialRequests={data.dfyRequests} />}
            {tab === "premium" && <PremiumTab />}
          </>
        )}
      </div>
    </div>
  );
}
