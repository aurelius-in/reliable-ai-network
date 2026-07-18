import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CheckoutButton } from "@/components/CheckoutButton";
import { TIERS } from "@/lib/tiers";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pricing — Make it Rain" };

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Logo href={user ? "/dashboard" : "/"} />
          {user ? (
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
              ← Back to dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-slate-300 hover:text-white">
              Login
            </Link>
          )}
        </div>

        <div className="mt-12 text-center">
          <h1 className="text-4xl font-black text-white">
            Simple pricing. <span className="gradient-text">Serious upside.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Every plan starts with a free 30-day <strong>Pro</strong> trial — full
            access, nothing watered down. Cancel anytime with one click.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                tier.highlight
                  ? "glow-card border-rain/50 bg-gradient-to-b from-rain/10 via-night-700 to-night-800"
                  : "border-night-600 bg-night-700"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-rain to-rain-bright px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                  <Crown size={12} /> Most popular
                </span>
              )}

              <h2 className="text-lg font-bold text-white">{tier.name}</h2>
              <p className="text-sm text-slate-400">{tier.tagline}</p>
              <p className="mt-4">
                <span className="text-4xl font-black text-white">${tier.price}</span>
                <span className="text-slate-400">/mo</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-200">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${tier.highlight ? "text-rain-bright" : "text-violet-bright"}`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <CheckoutButton
                  tier={tier.id}
                  authenticated={!!user}
                  label={
                    tier.highlight
                      ? "Start free 30-day trial"
                      : `Choose ${tier.name}`
                  }
                  className={
                    tier.highlight
                      ? "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rain to-rain-bright px-6 py-3 font-bold text-white shadow-lg shadow-rain/30 transition hover:brightness-110 disabled:opacity-60"
                      : undefined
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          The 30-day free trial runs on the Pro plan. Card collected upfront;
          you&apos;re charged only if you don&apos;t cancel before the trial ends.
          Downgrade or cancel anytime from your billing page.
        </p>
      </div>
    </div>
  );
}
