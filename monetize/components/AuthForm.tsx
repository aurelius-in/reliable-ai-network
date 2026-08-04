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
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup" && !agreedToTerms) {
      setError("Please agree to the Terms and Privacy Policy to continue.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "signup") {
        track("signup_submit");
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

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              ...(company.trim() ? { company: company.trim() } : {}),
              ...(referralCode ? { referral_code: referralCode } : {}),
              ...(variant === "reviewer" ? { signup_variant: "reviewer" } : {}),
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/confirm?next=/onboarding`,
          },
        });
        if (error) throw error;

        const homeAb = readHomeAbVariant();
        track("signup_success", {
          userId: data.user?.id ?? "",
          variant,
          ...(homeAb ? { home_ab: homeAb } : {}),
        });

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
          router.push("/onboarding");
          router.refresh();
        } else {
          // Email confirmation is enabled on the Supabase project.
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
        router.push(searchParams.get("next") ?? "/dashboard");
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      track(mode === "signup" ? "signup_error" : "login_error", {
        message: message.slice(0, 160),
      });
      setError(message);
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <div className="fade-up card-glow p-8 text-center">
        <h2 className="text-xl font-bold text-white">Check your email</h2>
        <p className="mt-2 text-sm text-slate-300">
          We sent a confirmation link to <span className="text-white">{email}</span>.
          Click it to activate your account and start making it rain.
        </p>
      </div>
    );
  }

  const inputClass = "input-dark";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <button
        type="submit"
        disabled={loading || (mode === "signup" && !agreedToTerms)}
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
            <Link href="/login" className="font-semibold text-rain-bright hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-rain-bright hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
