import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SharedReportPayload } from "@/lib/shared-report";

/** Public JSON for a shared report (used by print/email clients if needed). */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("shared_reports")
      .select("title, payload, created_at, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (error || !data || data.revoked_at) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      title: data.title,
      created_at: data.created_at,
      payload: data.payload as SharedReportPayload,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
