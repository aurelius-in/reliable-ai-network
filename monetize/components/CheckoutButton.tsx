"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  tier?: "starter" | "growth" | "pro";
  label: string;
  className?: string;
  /** When the visitor isn't signed in yet, send them to signup instead. */
  authenticated: boolean;
}

export function CheckoutButton({
  tier = "pro",
  label,
  className,
  authenticated,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!authenticated) {
      router.push("/signup");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-electric-bright px-6 py-3 font-semibold text-white shadow-lg shadow-electric/30 transition hover:brightness-110 disabled:opacity-60"
        }
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
