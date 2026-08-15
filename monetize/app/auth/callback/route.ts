import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maybeRedeemReviewerOnAuth } from "@/lib/redeem-reviewer-on-auth";

/** Handles the email-confirmation / magic-link redirect from Supabase. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext =
    type === "recovery" ? "/reset-password" : "/onboarding";
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
        console.error("Reviewer redeem on callback failed:", err);
      }
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return afterAuth();
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return afterAuth();
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
