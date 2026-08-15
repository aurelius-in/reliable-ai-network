import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import { loadAdminProductSubmissions } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/products?key=SECRET&limit=80
 * Founder review of product submissions (Q&A + user identity).
 */
export async function GET(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const limitRaw = new URL(request.url).searchParams.get("limit");
  const limit = Math.min(
    200,
    Math.max(1, Number.parseInt(limitRaw || "80", 10) || 80)
  );

  const result = await loadAdminProductSubmissions(limit);
  if ("error" in result) {
    console.error("[admin/products]", result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}
