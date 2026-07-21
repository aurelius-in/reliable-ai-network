import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/signups?key=SECRET
 * Founder-only signup counters + recent accounts.
 */
export async function GET(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  try {
    const admin = createAdminClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: total, error: totalError },
      { count: last7Days, error: weekError },
      { count: last24Hours, error: dayError },
      { count: trialing, error: trialError },
      { data: recent, error: recentError },
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trialing"),
      admin
        .from("profiles")
        .select(
          "id, email, name, subscription_status, current_tier, trial_ends_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    const firstError =
      totalError || weekError || dayError || trialError || recentError;
    if (firstError) {
      console.error("[admin/signups]", firstError);
      return NextResponse.json(
        { error: firstError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      total: total ?? 0,
      last7Days: last7Days ?? 0,
      last24Hours: last24Hours ?? 0,
      trialing: trialing ?? 0,
      recent: recent ?? [],
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[admin/signups]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load signups" },
      { status: 500 }
    );
  }
}
