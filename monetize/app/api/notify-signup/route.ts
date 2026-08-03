import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyFounderOfSignup } from "@/lib/notify-signup";

export const dynamic = "force-dynamic";

/**
 * POST /api/notify-signup
 * Called after AuthForm signup. Verifies the profile exists, then emails Oliver.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      name?: string;
      company?: string;
      variant?: string;
      homeAb?: string;
      userId?: string;
    } | null;

    const email = body?.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const admin = createAdminClient();

    let profileQuery = admin
      .from("profiles")
      .select("id, email, name, created_at")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (body?.userId) {
      profileQuery = admin
        .from("profiles")
        .select("id, email, name, created_at")
        .eq("id", body.userId)
        .limit(1);
    }

    const { data: rows, error } = await profileQuery;
    if (error) {
      console.error("[notify-signup] profile lookup failed:", error);
      return NextResponse.json({ error: "lookup failed" }, { status: 500 });
    }

    const profile = rows?.[0];
    if (!profile) {
      // Profile trigger can lag a beat; still notify with submitted email.
      const { count } = await admin
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const result = await notifyFounderOfSignup({
        email,
        name: body?.name,
        company: body?.company,
        variant: body?.variant,
        homeAb: body?.homeAb,
        userId: body?.userId,
        totalSignups: (count ?? 0) + 1,
      });

      return NextResponse.json({ ok: true, ...result, verified: false });
    }

    const createdAt = profile.created_at
      ? new Date(profile.created_at).getTime()
      : 0;
    const ageMs = Date.now() - createdAt;
    // Ignore stale / replayed notify calls older than 30 minutes.
    if (createdAt && ageMs > 30 * 60 * 1000) {
      return NextResponse.json({ ok: true, sent: false, reason: "stale" });
    }

    const { count } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const result = await notifyFounderOfSignup({
      email: profile.email,
      name: profile.name ?? body?.name,
      company: body?.company,
      variant: body?.variant,
      homeAb: body?.homeAb,
      userId: profile.id,
      totalSignups: count ?? undefined,
    });

    return NextResponse.json({ ok: true, ...result, verified: true });
  } catch (err) {
    console.error("[notify-signup]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "notify failed" },
      { status: 500 }
    );
  }
}
