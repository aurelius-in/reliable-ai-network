import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { CheckoutWithUpsells } from "@/components/CheckoutWithUpsells";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { TIERS } from "@/lib/tiers";
import { GUARANTEE } from "@/lib/guarantee";
import type { Tier } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — Make it RAIN" };

type SearchParams = Promise<{ tier?: string }>;

function parseTier(value: string | undefined): Tier {
  if (value === "starter" || value === "growth" || value === "pro") return value;
  return "pro";
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { tier: tierParam } = await searchParams;
  const tier = parseTier(tierParam);

  if (!user) {
    redirect(`/signup?next=${encodeURIComponent(`/checkout?tier=${tier}`)}`);
  }

  const tierInfo = TIERS.find((t) => t.id === tier);

  return (
    <div className="flex min-h-screen flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Logo href="/dashboard" />
        <Link
          href="/pricing"
          className="text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          ← Plans
        </Link>
      </div>

      <main className="mx-auto mt-8 w-full max-w-2xl flex-1">
        <div className="mb-6 text-center sm:text-left">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            Checkout
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {tierInfo ? `${tierInfo.name} plan` : "Start your trial"}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            {tierInfo
              ? `30-day trial of ${tierInfo.name}. A card is stored now. The plan bills after the trial unless you cancel.`
              : "30-day trial. A card is stored now. You are charged when the trial ends unless you cancel."}
          </p>
          <p className="mt-3 text-sm text-slate-200">
            {GUARANTEE.hook}. Cancel by day 30 and you pay $0.{" "}
            <Link href="/guarantee" className="text-slate-400 underline-offset-4 hover:text-white hover:underline">
              Terms
            </Link>
            .
          </p>
        </div>

        <CheckoutWithUpsells
          tier={tier}
          planPrice={tierInfo?.price ?? 149}
        />

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          Payments are processed by Stripe. Cancel anytime from Billing before
          day 30 to avoid being charged. Except where required by law, paid
          amounts are non-refundable.{" "}
          <Link href="/terms" className="underline hover:text-slate-300">
            Terms
          </Link>
          .
        </p>
      </main>

      <SiteFooter className="mt-10" />
    </div>
  );
}
