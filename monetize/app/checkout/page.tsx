import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { CheckoutWithUpsells } from "@/components/CheckoutWithUpsells";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { TIERS } from "@/lib/tiers";
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
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            Secure checkout
          </p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {tierInfo ? `${tierInfo.name} plan` : "Start your trial"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {tierInfo
              ? `30-day free trial of ${tierInfo.name}. Optionally add funnel services below (AI answering, content, leads, outreach). Card saved now — plan and any add-ons bill after the trial unless you cancel.`
              : "30-day free trial. Card saved now. Charged when the trial ends unless you cancel."}
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
