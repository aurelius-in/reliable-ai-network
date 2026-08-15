"use client";

import { useRouter } from "next/navigation";
import { track, trackUiClick } from "@/lib/track";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";

interface CheckoutButtonProps {
  tier?: "starter" | "growth" | "pro";
  label: string;
  className?: string;
  /** When the visitor isn't signed in yet, send them to signup instead. */
  authenticated: boolean;
  /** Extra ui_click target, e.g. homepage Pro sample CTA. */
  trackTarget?: string;
}

export function CheckoutButton({
  tier = "pro",
  label,
  className,
  authenticated,
  trackTarget,
}: CheckoutButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (trackTarget) {
      trackUiClick(trackTarget, { tier, authenticated });
    }
    track("checkout_click", { tier, authenticated });
    if (!authenticated) {
      track("checkout_redirect_signup", { tier });
      let refParam = "";
      try {
        const code = normalizeReferralCode(
          localStorage.getItem(REFERRAL_STORAGE_KEY)
        );
        if (code) refParam = `&ref=${encodeURIComponent(code)}`;
      } catch {
        /* ignore */
      }
      router.push(
        `/signup?next=${encodeURIComponent(`/checkout?tier=${tier}`)}${refParam}`
      );
      return;
    }
    track("checkout_open_embedded", { tier });
    router.push(`/checkout?tier=${tier}`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={
          className ??
          "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rain to-rain-bright px-6 py-3 font-semibold text-white shadow-lg shadow-rain/30 transition hover:brightness-110 disabled:opacity-60"
        }
      >
        {label}
      </button>
    </div>
  );
}
