"use client";

import { useMemo, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { CheckoutUpsells } from "@/components/CheckoutUpsells";
import { getStripeJs } from "@/lib/stripe-client";
import type { Tier } from "@/lib/stripe";
import type { CheckoutUpsellId } from "@/lib/checkout-upsells";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";

/**
 * Upsell picker + remounting embedded Stripe checkout when selection changes.
 */
export function CheckoutWithUpsells({
  tier,
  planPrice,
}: {
  tier: Tier;
  planPrice: number;
}) {
  const stripePromise = useMemo(() => getStripeJs(), []);
  const [selected, setSelected] = useState<CheckoutUpsellId[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectionKey = selected.slice().sort().join(",");

  const fetchClientSecret = useMemo(() => {
    return async () => {
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
        body: JSON.stringify({
          tier,
          referralCode,
          upsells: selected,
        }),
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
    };
  }, [tier, selected]);

  return (
    <div>
      <CheckoutUpsells
        selected={selected}
        onChange={setSelected}
        planPrice={planPrice}
      />

      <div className="mb-3 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Payment
        </p>
        <p className="mt-0.5 text-sm text-slate-400">
          Card required to start the trial. You will not be charged until the
          trial ends.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-night-600 bg-night-800 shadow-[0_0_40px_rgba(0,168,196,0.08)]">
        {error && (
          <p className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
            {error}
          </p>
        )}
        <EmbeddedCheckoutProvider
          key={`checkout-${tier}-${selectionKey || "none"}`}
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout className="embedded-checkout" />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
