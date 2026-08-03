"use client";

import { useCallback, useMemo, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { getStripeJs } from "@/lib/stripe-client";
import type { Tier } from "@/lib/stripe";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";

export function EmbeddedCheckoutForm({ tier }: { tier: Tier }) {
  const stripePromise = useMemo(() => getStripeJs(), []);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    let referralCode: string | null = null;
    try {
      referralCode = normalizeReferralCode(
        localStorage.getItem(REFERRAL_STORAGE_KEY)
      );
    } catch {
      referralCode = null;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, referralCode }),
    });
    const data = (await res.json()) as {
      clientSecret?: string;
      error?: string;
    };
    if (!res.ok || !data.clientSecret) {
      const message = data.error ?? "Could not start checkout";
      setError(message);
      throw new Error(message);
    }
    return data.clientSecret;
  }, [tier]);

  return (
    <div className="overflow-hidden rounded-2xl border border-night-600 bg-night-800 shadow-[0_0_40px_rgba(0,168,196,0.08)]">
      {error && (
        <p className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
          {error}
        </p>
      )}
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout className="embedded-checkout" />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
