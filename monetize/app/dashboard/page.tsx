import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { TrialBanner } from "@/components/TrialBanner";
import { DashboardTabs, type DashboardData } from "@/components/DashboardTabs";
import { createClient } from "@/lib/supabase/server";
import { DFY_ASSET_TYPE } from "@/lib/dfy";
import type {
  ContentBundle,
  Creation,
  FunnelPlan,
  GeneratedAsset,
  IdeaAnalysis,
  PricingRecommendation,
  ProgressLog,
  Profile,
  StrategyResults,
  StrategyToolId,
} from "@/types";

export const metadata = { title: "Dashboard — RAIN Monetize" };

const ASSET_LABELS: Record<string, string> = {
  idea_analysis: "Idea analyses",
  pricing: "Pricing plans",
  funnel: "Funnels",
  content_bundle: "Content bundles",
  strategy_competitors: "Competitor scans",
  strategy_pricing_optimization: "Pricing optimizations",
  strategy_roadmap: "Roadmaps",
  strategy_ab_tests: "A/B test plans",
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
  let initialFunnel: FunnelPlan | null = null;
  let initialBundle: ContentBundle | null = null;
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
    } else if (asset.type === "funnel") {
      if (!initialFunnel) initialFunnel = asset.content as FunnelPlan;
    } else if (asset.type === "content_bundle") {
      if (!initialBundle) initialBundle = asset.content as ContentBundle;
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

  // "You have X assets ready" stats (DFY requests aren't finished assets).
  const countsByType = new Map<string, number>();
  for (const asset of allAssets) {
    if (asset.type === DFY_ASSET_TYPE) continue;
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
    initialFunnel,
    initialBundle,
    initialStrategy,
    initialProgress,
    assetStats,
    dfyRequests,
  };

  const typedProfile = profile as Profile | null;
  const firstName =
    typedProfile?.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "creator";

  return (
    <div className="min-h-screen">
      <TopNav profile={typedProfile} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <TrialBanner profile={typedProfile} />

        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Let&apos;s make it rain, {firstName}.
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Nine tools. One goal: turn what you built into income.
          </p>
        </div>

        <DashboardTabs
          currentTier={typedProfile?.current_tier ?? null}
          data={data}
        />
      </main>
    </div>
  );
}
