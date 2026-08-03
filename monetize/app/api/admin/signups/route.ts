import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import { loadCounterStats, parseCounterRange } from "@/lib/counter-stats";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/signups?key=SECRET&range=today|7d|month|all
 * Legacy alias → Counter payload (accounts + activity).
 */
export async function GET(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const range = parseCounterRange(
    new URL(request.url).searchParams.get("range")
  );
  const stats = await loadCounterStats(range);
  if ("error" in stats) {
    console.error("[admin/signups]", stats.error);
    return NextResponse.json({ error: stats.error }, { status: 500 });
  }

  // Keep old shape fields for any bookmarks that expect them.
  return NextResponse.json({
    ...stats,
    total: stats.accounts.total,
    last7Days: stats.accounts.newInRange,
    last24Hours:
      stats.range === "today" ? stats.accounts.newInRange : undefined,
    trialing: stats.accounts.trialing,
  });
}
