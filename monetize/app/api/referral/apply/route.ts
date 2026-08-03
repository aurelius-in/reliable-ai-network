import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyReferralCode, ensureReferralCode } from "@/lib/referral-server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";

/** Attribute the logged-in user to a referral code (once). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let code: string | null = null;
  try {
    const body = await request.json();
    code = typeof body?.code === "string" ? body.code : null;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await ensureProfile(user);
  const admin = createAdminClient();
  await ensureReferralCode(admin, user.id);
  const result = await applyReferralCode(admin, user.id, code);

  return NextResponse.json(result);
}
