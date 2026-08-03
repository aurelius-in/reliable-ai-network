import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { MobileTabBar } from "@/components/MobileTabBar";
import { TrialBanner } from "@/components/TrialBanner";
import { AccessCodeAutoRedeem } from "@/components/AccessCodeAutoRedeem";
import { ReviewerFeedbackBanner } from "@/components/ReviewerFeedbackBanner";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ReferralAttributor } from "@/components/ReferralAttributor";
import { ReferralNudge } from "@/components/ReferralNudge";
import { DashboardTabs, type DashboardData } from "@/components/DashboardTabs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureReferralCode } from "@/lib/referral-server";
import { getAppUrl } from "@/lib/stripe";
import { DFY_ASSET_TYPE } from "@/lib/dfy";
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
  ProgressLog,
  Profile,
  RevenueStreamsPlan,
  SalesKit,
  StrategyResults,
  StrategyToolId,
  TrafficPlan,
} from "@/types";

export const metadata = { title: "Dashboard — Make it RAIN" };

const ASSET_LABELS: Record<string, string> = {
  idea_analysis: "Idea analyses",
  pricing: "Pricing plans",
  buyer_profiles: "Buyer profiles",
  funnel: "Funnels",
  traffic_plan: "Traffic plans",
  launch_plan: "Launch plans",
  content_bundle: "Content bundles",
  strategy_competitors: "Competitor scans",
  strategy_pricing_optimization: "Pricing optimizations",
  strategy_roadmap: "Roadmaps",
  strategy_ab_tests: "A/B test plans",
  sales_kit: "Sales kits",
  metrics_analysis: "Results analyses",
  revenue_streams: "Revenue maps",
  [DFY_ASSET_TYPE]: "Done-For-You requests",
};

const STRATEGY_TOOL_IDS: StrategyToolId[] = [
  "competitors",
  "pricing_optimization",
  "roadmap",
  "ab_tests",
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [{ data: profile }, { data: creations }, { data: assets }, { data: progressLogs }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("creations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("generated_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("progress_logs").select("*").eq("user_id", user.id),
    ]);

  const allAssets = (assets ?? []) as GeneratedAsset[];

  // Latest asset per creation wins (assets are sorted newest-first).
  const initialAnalyses: Record<string, IdeaAnalysis> = {};
  const initialPricings: Record<string, PricingRecommendation> = {};
  let initialBuyers: BuyerProfilesResult | null = null;
  let initialFunnel: FunnelPlan | null = null;
  let initialTraffic: TrafficPlan | null = null;
  let initialLaunch: LaunchPlan | null = null;
  let initialBundle: ContentBundle | null = null;
  let initialSalesKit: SalesKit | null = null;
  let initialRevenue: RevenueStreamsPlan | null = null;
  let initialMetricsAnalysis: MetricsAnalysis | null = null;
  const metricsEntries: MetricsEntry[] = [];
  const initialStrategy: StrategyResults = {};
  const dfyRequests: GeneratedAsset[] = [];

  for (const asset of allAssets) {
    if (asset.type === "idea_analysis" && asset.creation_id) {
      if (!initialAnalyses[asset.creation_id]) {
        initialAnalyses[asset.creation_id] = asset.content as IdeaAnalysis;
      }
    } else if (asset.type === "pricing" && asset.creation_id) {
      if (!initialPricings[asset.creation_id]) {
        initialPricings[asset.creation_id] = asset.content as PricingRecommendation;
      }
    } else if (asset.type === "buyer_profiles") {
      if (!initialBuyers) initialBuyers = asset.content as BuyerProfilesResult;
    } else if (asset.type === "funnel") {
      if (!initialFunnel) initialFunnel = asset.content as FunnelPlan;
    } else if (asset.type === "traffic_plan") {
      if (!initialTraffic) initialTraffic = asset.content as TrafficPlan;
    } else if (asset.type === "launch_plan") {
      if (!initialLaunch) initialLaunch = asset.content as LaunchPlan;
    } else if (asset.type === "content_bundle") {
      if (!initialBundle) initialBundle = asset.content as ContentBundle;
    } else if (asset.type === "sales_kit") {
      if (!initialSalesKit) initialSalesKit = asset.content as SalesKit;
    } else if (asset.type === "revenue_streams") {
      if (!initialRevenue) initialRevenue = asset.content as RevenueStreamsPlan;
    } else if (asset.type === "metrics_analysis") {
      if (!initialMetricsAnalysis) {
        initialMetricsAnalysis = asset.content as MetricsAnalysis;
      }
    } else if (asset.type === "metrics_log") {
      // Assets arrive newest-first; the chart wants oldest-first.
      metricsEntries.unshift(asset.content as MetricsEntry);
    } else if (asset.type === DFY_ASSET_TYPE) {
      dfyRequests.push(asset);
    } else if (asset.type.startsWith("strategy_")) {
      const tool = asset.type.replace("strategy_", "") as StrategyToolId;
      if (STRATEGY_TOOL_IDS.includes(tool) && !initialStrategy[tool]) {
        // Latest result per strategy tool.
        (initialStrategy as Record<string, unknown>)[tool] = asset.content;
      }
    }
  }

  // "You have X assets ready" stats (DFY requests and weekly metric
  // log entries aren't finished assets).
  const countsByType = new Map<string, number>();
  for (const asset of allAssets) {
    if (asset.type === DFY_ASSET_TYPE || asset.type === "metrics_log") continue;
    countsByType.set(asset.type, (countsByType.get(asset.type) ?? 0) + 1);
  }
  const assetStats = {
    total: [...countsByType.values()].reduce((a, b) => a + b, 0),
    byLabel: [...countsByType.entries()]
      .map(([type, count]) => ({ label: ASSET_LABELS[type] ?? type, count }))
      .sort((a, b) => b.count - a.count),
  };

  const initialProgress: Record<string, boolean> = {};
  for (const log of (progressLogs ?? []) as ProgressLog[]) {
    initialProgress[log.milestone] = log.completed;
  }

  const data: DashboardData = {
    creations: (creations ?? []) as Creation[],
    initialAnalyses,
    initialPricings,
    initialBuyers,
    initialFunnel,
    initialTraffic,
    initialLaunch,
    initialBundle,
    initialStrategy,
    initialSalesKit,
    initialRevenue,
    metricsEntries,
    initialMetricsAnalysis,
    initialProgress,
    assetStats,
    dfyRequests,
  };

  const typedProfile = profile as Profile | null;
  const firstName =
    typedProfile?.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "creator";

  const admin = createAdminClient();
  const referralCode =
    typedProfile?.referral_code ||
    (await ensureReferralCode(admin, user.id));

  return (
    <div className="min-h-screen">
      <TopNav profile={typedProfile} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] md:space-y-8 md:py-8">
        <ReferralAttributor />
        <TrialBanner profile={typedProfile} />

        <AccessCodeAutoRedeem />

        <ReviewerFeedbackBanner
          subscriptionStatus={typedProfile?.subscription_status}
        />

        <InstallPrompt />

        {referralCode ? (
          <ReferralNudge code={referralCode} appUrl={getAppUrl()} />
        ) : null}

        <div>
          <h1 className="text-xl font-black text-white sm:text-2xl">
            Let&apos;s make it RAIN, {firstName}.
          </h1>
          <p className="mt-1.5 text-sm text-aqua">
            Turn what you built into income.
          </p>
        </div>

        <DashboardTabs
          currentTier={typedProfile?.current_tier ?? null}
          data={data}
        />
      </main>

      <MobileTabBar tier={typedProfile?.current_tier ?? null} />
    </div>
  );
}
