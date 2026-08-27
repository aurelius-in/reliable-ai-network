import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { DealEconomicsCalculator } from "@/components/DealEconomicsCalculator";
import { ProblemValueCalculator } from "@/components/ProblemValueCalculator";
import { GUARANTEE } from "@/lib/guarantee";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "What is another unpaid month costing you?",
  description:
    "A few of your numbers. See the economics of staying unpaid. Then run First Customer Path. No URL required.",
  alternates: { canonical: "/deal-economics" },
};

export default async function DealEconomicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo href={user ? "/dashboard" : "/"} />
        <TrackedLink
          href={user ? "/dashboard?tab=pricing" : "/signup?from=unpaid-month"}
          trackTarget={user ? "deal_page_cta_dashboard" : "deal_page_cta_signup"}
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          {user ? "Back to dashboard" : GUARANTEE.cta}
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        {user ? (
          <>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              Inside the product
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
              Proposal economics
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              This is the deeper calculator: delivery, compensation, margin, and
              what you should charge. The homepage one is a different animal. It
              shows the cost of another unpaid month so people walk in through
              one problem, not fifteen tools.
            </p>
            <div className="mt-6">
              <DealEconomicsCalculator />
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              One entry problem
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
              The cost of staying unpaid
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Put in a few numbers. See the economics of your own problem.
              First Customer Path is the next step: who may pay, stress-test
              the offer, the next conversation. Proposal and closer math wait
              inside after you save an account.
            </p>
            <div className="mt-6">
              <ProblemValueCalculator
                signupHref="/signup?from=unpaid-month"
                primaryHref="/#home-product-url"
              />
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
