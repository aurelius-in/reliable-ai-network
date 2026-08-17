"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/track";
import { readHomeAbFromDocument } from "@/lib/home-ab";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";
import {
  ACCESS_CODE_STORAGE_KEY,
  normalizeAccessCode,
} from "@/lib/access-codes";
import { safeInternalNext } from "@/lib/safe-next";

/** Redeem invite code while session exists (same browser as invite page). */
async function redeemStoredAccessCodeIfAny(): Promise<void> {
  let stored: string | null = null;
  try {
    stored = normalizeAccessCode(
      localStorage.getItem(ACCESS_CODE_STORAGE_KEY)
    );
  } catch {
    return;
  }
  if (!stored) return;
  try {
    const res = await fetch("/api/access-code/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: stored }),
    });
    if (res.ok || res.status === 400 || res.status === 409) {
      try {
        localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* AutoRedeem / confirm path can retry */
  }
}

function readHomeAbVariant(): string | undefined {
  return readHomeAbFromDocument() ?? undefined;
}

export function AuthForm({
  mode,
  variant = "default",
  submitLabel,
  collectCompany = false,
}: {
  mode: "signup" | "login";
  variant?: "default" | "reviewer";
  submitLabel?: string;
  collectCompany?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsConfirm(false);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        track("signup_submit");
        if (!agreedToTerms) {
          setError("Please agree to the Terms and Privacy Policy to continue.");
          track("signup_terms_blocked");
          setLoading(false);
          return;
        }
        let referralCode: string | null = normalizeReferralCode(
          searchParams.get("ref")
        );
        if (!referralCode) {
          try {
            referralCode = normalizeReferralCode(
              localStorage.getItem(REFERRAL_STORAGE_KEY)
            );
          } catch {
            referralCode = null;
          }
        }

        const origin =
          process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
        const inviteParam =
          searchParams.get("invite")?.trim() ||
          (variant === "reviewer" ? "reviewer" : "");
        const nextAfterConfirm = inviteParam
          ? `/onboarding?invite=${encodeURIComponent(inviteParam)}`
          : safeInternalNext(searchParams.get("next"), "/onboarding");

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              ...(company.trim() ? { company: company.trim() } : {}),
              ...(referralCode ? { referral_code: referralCode } : {}),
              ...(variant === "reviewer" || inviteParam
                ? { signup_variant: "reviewer" }
                : {}),
            },
            emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextAfterConfirm)}`,
          },
        });
        if (error) throw error;

        const homeAb = readHomeAbVariant();
        track("signup_success", {
          userId: data.user?.id ?? "",
          variant,
          ...(homeAb ? { home_ab: homeAb } : {}),
        });
        try {
          sessionStorage.setItem("rain_signup_progressed", "1");
        } catch {
          /* ignore */
        }

        // Fire-and-forget founder alert + counter bump email.
        void fetch("/api/notify-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            company: company.trim() || undefined,
            variant,
            homeAb,
            userId: data.user?.id,
          }),
        }).catch(() => {});

        if (referralCode && data.session) {
          void fetch("/api/referral/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: referralCode }),
          }).catch(() => {});
        }

        if (data.session) {
          await redeemStoredAccessCodeIfAny();
          router.push(nextAfterConfirm);
          router.refresh();
        } else {
          // Email confirmation is enabled on the Supabase project.
          // Server redeem runs on /auth/confirm via signup_variant + ?invite=.
          track("signup_needs_confirmation");
          setConfirmationSent(true);
          setLoading(false);
        }
      } else {
        track("login_submit");
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        track("login_success");
        await redeemStoredAccessCodeIfAny();
        const invite = searchParams.get("invite")?.trim();
        const next =
          safeInternalNext(searchParams.get("next"), "") ||
          (invite
            ? `/dashboard?invite=${encodeURIComponent(invite)}`
            : "/dashboard");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      track(mode === "signup" ? "signup_error" : "login_error", {
        message: message.slice(0, 160),
      });
      if (
        mode === "login" &&
        /not confirmed|confirm your email|email not confirmed/i.test(message)
      ) {
        setNeedsConfirm(true);
      }
      setError(message);
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!email.trim()) return;
    setResendLoading(true);
    setResendNote(null);
    setError(null);
    try {
      const supabase = createClient();
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const inviteParam =
        searchParams.get("invite")?.trim() ||
        (variant === "reviewer" ? "reviewer" : "");
      const nextAfterConfirm = inviteParam
        ? `/onboarding?invite=${encodeURIComponent(inviteParam)}`
        : safeInternalNext(searchParams.get("next"), "/onboarding");
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextAfterConfirm)}`,
        },
      });
      if (resendError) throw resendError;
      track("signup_resend_confirmation");
      setResendNote("Sent another link. Check spam if it is not in the inbox.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not resend the link";
      setError(message);
    } finally {
      setResendLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <div className="fade-up card-glow p-8 text-center">
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="mt-2 text-sm text-slate-300">
          We sent a confirmation link to{" "}
          <span className="text-white">{email}</span>. Click it to activate your
          account
          {variant === "reviewer"
            ? " and unlock complimentary reviewer access"
            : ", then paste your product URL for First Customer Path"}
          .
        </p>
        <p className="mt-3 text-xs text-slate-500">
          The link expires. If nothing arrives in a couple of minutes, check
          spam, or send it again below.
        </p>
        {resendNote ? (
          <p className="mt-3 text-sm text-aqua-bright">{resendNote}</p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={() => void resendConfirmation()}
          disabled={resendLoading}
          className="btn-primary mt-5 w-full"
        >
          {resendLoading && <Loader2 size={16} className="animate-spin" />}
          Send the link again
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Already confirmed?{" "}
          <Link
            href={
              searchParams.get("next")
                ? `/login?next=${encodeURIComponent(searchParams.get("next") || "")}`
                : "/login"
            }
            className="font-semibold text-rain-bright hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  const inviteQs = searchParams.get("invite");
  const nextQs = searchParams.get("next");
  const loginParams = new URLSearchParams();
  const signupParams = new URLSearchParams();
  if (inviteQs) {
    loginParams.set("invite", inviteQs);
    signupParams.set("invite", inviteQs);
  }
  if (nextQs) {
    loginParams.set("next", nextQs);
    signupParams.set("next", nextQs);
  }
  const loginHref = loginParams.size ? `/login?${loginParams}` : "/login";
  const signupHref = signupParams.size ? `/signup?${signupParams}` : "/signup";

  const inputClass = "input-dark";
  const authError = searchParams.get("error");
  const authErrorCopy =
    authError === "auth"
      ? "That confirmation link expired or already got used. Sign in below, or create the account again to get a new link."
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {authErrorCopy ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {authErrorCopy}
        </p>
      ) : null}
      {mode === "signup" && (
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First and last name"
          className={inputClass}
          autoComplete="name"
        />
      )}
      {mode === "signup" && collectCompany && (
        <input
          type="text"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company or app name"
          className={inputClass}
          autoComplete="organization"
        />
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={inputClass}
        autoComplete="email"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
        className={inputClass}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />

      {mode === "login" && (
        <div className="-mt-1 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-slate-400 hover:text-rain-bright hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      )}

      {mode === "signup" && (
        <label className="flex cursor-pointer items-start gap-3 text-left text-xs leading-relaxed text-slate-400">
          <input
            type="checkbox"
            required
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-night-600 bg-night-800 text-aqua focus:ring-aqua"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-slate-300 underline hover:text-white"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-slate-300 underline hover:text-white"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {mode === "login" && needsConfirm ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100">
          <p>
            Your email is not confirmed yet. Send the link again, then come
            back to sign in.
          </p>
          {resendNote ? (
            <p className="mt-2 text-aqua-bright">{resendNote}</p>
          ) : null}
          <button
            type="button"
            onClick={() => void resendConfirmation()}
            disabled={resendLoading || !email.trim()}
            className="btn-primary mt-3 w-full !py-2.5 text-sm"
          >
            {resendLoading && <Loader2 size={16} className="animate-spin" />}
            Send the confirmation link again
          </button>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >

        {loading && <Loader2 size={16} className="animate-spin" />}
        {mode === "signup"
          ? submitLabel || "Get my tailored playbook"
          : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-400">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-rain-bright hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href={signupHref}
              className="font-semibold text-rain-bright hover:underline"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
