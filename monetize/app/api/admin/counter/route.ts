import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import { loadCounterStats } from "@/lib/counter-stats";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/counter?key=SECRET
 * Founder Counter: accounts + funnel activity.
 */
export async function GET(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const stats = await loadCounterStats();
  if ("error" in stats) {
    return NextResponse.json({ error: stats.error }, { status: 500 });
  }
  return NextResponse.json(stats);
}
