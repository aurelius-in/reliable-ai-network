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

  return (
    <header className="sticky top-0 z-40 border-b border-night-600/60 bg-night-800/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
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
          </span>

          {tier !== "pro" && (
            <Link
              href="/pricing"
              className="hidden rounded-lg bg-gradient-to-r from-rain to-rain-bright px-3.5 py-1.5 text-xs font-bold text-white shadow shadow-rain/30 transition hover:brightness-110 sm:inline-block"
            >
              Upgrade
            </Link>
          )}

          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
