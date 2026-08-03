import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import { loadCounterStats, parseCounterRange } from "@/lib/counter-stats";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/counter?key=SECRET&range=today|7d|month|all
 * Founder Counter: accounts + funnel activity.
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
    return NextResponse.json({ error: stats.error }, { status: 500 });
  }
  return NextResponse.json(stats);
}
