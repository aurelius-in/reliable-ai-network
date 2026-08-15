import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maybeRedeemReviewerOnAuth } from "@/lib/redeem-reviewer-on-auth";

/**
 * Email confirmation / recovery landing page.
 * Supabase templates often link here with ?token_hash=...&type=email|recovery
 * (see Authentication → Email Templates). Recovery continues to /reset-password.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext = type === "recovery" ? "/reset-password" : "/onboarding";
  const nextRaw = searchParams.get("next") ?? defaultNext;
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : defaultNext;

  const supabase = await createClient();

  async function afterAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && type !== "recovery") {
      try {
        await maybeRedeemReviewerOnAuth(user, next);
      } catch (err) {
        console.error("Reviewer redeem on confirm failed:", err);
      }
    }
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return afterAuth();
    }
  }

  // PKCE-style links sometimes land here with ?code= instead.
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return afterAuth();
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", request.url));
}
