"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          },
        });
        if (error) throw error;

        // Fire-and-forget founder alert + counter bump email.
        void fetch("/api/notify-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            userId: data.user?.id,
          }),
        }).catch(() => {});

        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          // Email confirmation is enabled on the Supabase project.
          setConfirmationSent(true);
          setLoading(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(searchParams.get("next") ?? "/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          placeholder="Your name"
          className={inputClass}
          autoComplete="name"
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

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">

        {loading && <Loader2 size={16} className="animate-spin" />}
        {mode === "signup" ? "Create account" : "Sign in"}
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
