import Link from "next/link";
import { Check, Crown, Star } from "lucide-react";
import { Logo } from "@/components/Logo";
import { CheckoutButton } from "@/components/CheckoutButton";
import { PaidNextOffer } from "@/components/PaidNextOffer";
import { SiteFooter } from "@/components/SiteFooter";
import { TIERS } from "@/lib/tiers";
import { createClient } from "@/lib/supabase/server";
import { GUARANTEE } from "@/lib/guarantee";

export const metadata = {
  title: "Pricing",
  description:
    "Starter: find who may pay. Growth: reach them. Pro: learn what closes. Free First Customer Path. 30-day trial. Not an app builder.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Make it RAIN",
    description:
      "Progress, not tool counts. Find who may pay, reach them, learn what closes. Free 30-day trial.",
  },
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const status = profile?.subscription_status ?? null;
  const showFullOffer = Boolean(user) && (!status || status === "canceled");
  const showSelectOnly = Boolean(
    user &&
      status &&
      status !== "canceled" &&
      status !== "reviewer" &&
      status !== "retention"
  );

  return (
    <div className="min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-7xl">
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-aqua">
            After you see the brief
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            Progress, not tool counts.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            {user ? (
              <>
                Pick the plan that matches the job in front of you. Change or
                cancel anytime from your billing page.
              </>
            ) : (
              <>
                Run First Customer Path free. Then pick Starter, Growth, or Pro
                based on what the brief found. 30-day trial. Cancel before day
                30. You keep the product and the code.
              </>
            )}
          </p>
        </div>

        {showFullOffer ? (
          <div className="mx-auto mt-10 max-w-5xl">
            <PaidNextOffer placement="pricing" />
          </div>
        ) : null}
        {showSelectOnly ? (
          <div className="mx-auto mt-10 max-w-5xl">
            <PaidNextOffer placement="pricing" mode="select_only" />
          </div>
        ) : null}

        <section className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-night-800/80 px-5 py-6 text-left sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            What you are buying
          </p>
          <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
            A clearer path from shipped to someone might pay
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Another unpaid month, another feature, a ChatGPT plan, a cheap
            pack of leads, or ads on a guess. Those are the real alternatives.
            Make it RAIN finds who may pay, stress-tests the offer, and names
            the next conversation.
          </p>
          <ul className="rain-list mt-4 space-y-2 text-sm text-slate-200">
            <li>Starter: find who may pay and get the offer ready</li>
            <li>Growth: reach them and run the work</li>
            <li>Pro: learn what closes and keep improving the next move</li>
            <li>Tool counts sit underneath. They do not carry the sale.</li>
          </ul>
          <p className="mt-4 text-sm font-semibold text-white">
            {GUARANTEE.hook}
          </p>
          <p className="mt-1 text-xs text-slate-500">{GUARANTEE.hookSecondary}</p>
          <p className="mt-1 text-sm text-slate-400">
            Free {GUARANTEE.baitName} to start. Plans from{" "}
            <span className="font-semibold text-white">$29/mo</span> after trial.
            No card required to begin.{" "}
            <Link
              href="/guarantee"
              className="font-semibold text-aqua hover:text-aqua-bright"
            >
              Guarantee terms
            </Link>
            .
          </p>
        </section>

        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-6 lg:p-7 ${
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
              <p className="mt-3 text-sm leading-snug text-slate-300">
                {tier.summary}
              </p>
              <p className="mt-4">
                <span className="text-4xl font-black text-white">${tier.price}</span>
                <span className="text-slate-400">/mo</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((feature) => {
                  const everythingMatch = feature.match(
                    /^(Everything in (?:Starter|Growth))(.*)$/
                  );
                  return (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-200"
                    >
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${tier.highlight ? "text-rain-bright" : "text-violet-bright"}`}
                      />
                      {everythingMatch ? (
                        <span>
                          <strong className="font-bold text-white">
                            {everythingMatch[1]}
                          </strong>
                          {everythingMatch[2]}
                        </span>
                      ) : (
                        feature
                      )}
                    </li>
                  );
                })}
                {tier.starValue && (
                  <li className="flex items-start gap-2 pt-1 text-sm font-semibold text-white">
                    <Star
                      size={16}
                      className={`mt-0.5 shrink-0 ${tier.highlight ? "text-rain-bright" : "text-violet-bright"}`}
                      fill="currentColor"
                    />
                    <span>{tier.starValue}</span>
                  </li>
                )}
              </ul>

              <div className="mt-7">
                <CheckoutButton
                  tier={tier.id}
                  authenticated={!!user}
                  label={
                    user
                      ? `Choose ${tier.name}`
                      : `Try ${tier.name} free for 30 days`
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

        {!user && (
          <p className="mt-10 text-center text-sm text-slate-500">
            Trial matches the plan you pick ($29, $79, or $149). After 30 days
            you&apos;re billed that plan&apos;s price unless you cancel. Change
            or cancel anytime from Billing.
          </p>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Cancel before day 30 to avoid being charged. Except where required by
          law, payments are non-refundable. See{" "}
          <Link href="/terms" className="underline hover:text-slate-300">
            Terms
          </Link>
          .
        </p>

        <SiteFooter className="mt-10 border-0" />
      </div>
    </div>
  );
}
