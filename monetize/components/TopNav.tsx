import Link from "next/link";
import { Crown } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { tierLabel } from "@/lib/tiers";
import type { Profile } from "@/types";

export function TopNav({ profile }: { profile: Profile | null }) {
  const tier = profile?.current_tier;
  const status = profile?.subscription_status;
  const isTrialing = status === "trialing";
  const isReviewer = status === "reviewer";
  const isRetention = status === "retention";
  const isComp = isReviewer || isRetention;

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/10 bg-night-800/70 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:h-16">
        <Logo href="/dashboard" />

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/billing" className="transition hover:text-white">
            Billing
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              tier === "pro"
                ? "bg-violet/15 text-violet-bright ring-1 ring-violet/40"
                : tier
                  ? "bg-rain/15 text-rain-bright ring-1 ring-rain/40"
                  : "bg-night-600 text-slate-300 ring-1 ring-night-600"
            }`}
          >
            {tier === "pro" && <Crown size={12} />}
            {tierLabel(tier)}
            {isTrialing && <span className="font-medium normal-case">trial</span>}
            {isReviewer && (
              <span className="font-medium normal-case">reviewer</span>
            )}
            {isRetention && (
              <span className="font-medium normal-case">comp</span>
            )}
          </span>

          {tier !== "pro" && !isComp && (
            <Link
              href="/pricing"
              className="hidden border border-white/25 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white transition hover:border-white hover:bg-white hover:text-night-900 sm:inline-block"
            >
              Continue
            </Link>
          )}

          {/* On phones, sign-out lives in the bottom bar's Account sheet. */}
          <span className="hidden md:block">
            <SignOutButton />
          </span>
        </div>
      </div>
    </header>
  );
}
