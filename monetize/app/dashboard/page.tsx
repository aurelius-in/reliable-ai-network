import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { TrialBanner } from "@/components/TrialBanner";
import { DashboardTabs, LockedTierCards } from "@/components/DashboardTabs";
import { createClient } from "@/lib/supabase/server";
import type {
  Creation,
  GeneratedAsset,
  IdeaAnalysis,
  PricingRecommendation,
  Profile,
} from "@/types";

export const metadata = { title: "Dashboard — RAIN Monetize" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [{ data: profile }, { data: creations }, { data: assets }] =
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
        .in("type", ["idea_analysis", "pricing"])
        .order("created_at", { ascending: false }),
    ]);

  // Latest asset per creation wins (assets are sorted newest-first).
  const initialAnalyses: Record<string, IdeaAnalysis> = {};
  const initialPricings: Record<string, PricingRecommendation> = {};
  for (const asset of (assets ?? []) as GeneratedAsset[]) {
    if (!asset.creation_id) continue;
    if (asset.type === "idea_analysis" && !initialAnalyses[asset.creation_id]) {
      initialAnalyses[asset.creation_id] = asset.content as IdeaAnalysis;
    }
    if (asset.type === "pricing" && !initialPricings[asset.creation_id]) {
      initialPricings[asset.creation_id] = asset.content as PricingRecommendation;
    }
  }

  const firstName =
    (profile as Profile | null)?.name?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "creator";

  return (
    <div className="min-h-screen">
      <TopNav profile={profile as Profile | null} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <TrialBanner profile={profile as Profile | null} />

        <div>
          <h1 className="text-2xl font-black text-white">
            Let&apos;s make it rain, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Your monetization toolkit — analyze, price, and launch.
          </p>
        </div>

        <DashboardTabs
          creations={(creations ?? []) as Creation[]}
          initialAnalyses={initialAnalyses}
          initialPricings={initialPricings}
        />

        <div className="border-t border-night-600/60 pt-8">
          <LockedTierCards
            currentTier={(profile as Profile | null)?.current_tier ?? null}
          />
        </div>
      </main>
    </div>
  );
}
