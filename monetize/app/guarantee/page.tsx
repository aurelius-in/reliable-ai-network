import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { GUARANTEE } from "@/lib/guarantee";

export const metadata: Metadata = {
  title: "Guarantee terms",
  description: GUARANTEE.hook,
  alternates: { canonical: "/guarantee" },
};

export default function GuaranteePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <TrackedLink
          href="/signup"
          trackTarget="guarantee_cta_signup"
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          Start free
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 text-left">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Guarantee terms
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
          {GUARANTEE.hook}
        </h1>
        <p className="mt-4 text-sm text-slate-400">
          Short on the homepage. Specific here: what you get, how 2× is
          measured, and what “money back” means.
        </p>

        <section className="mt-8 rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 to-night-800 px-5 py-6">
          <h2 className="text-lg font-bold text-white">In plain English</h2>
          <p className="mt-2 text-sm text-slate-300">
            You get a <strong className="text-white">tailored customer playbook</strong>{" "}
            for the product you already built (not a generic template). Over{" "}
            {GUARANTEE.windowDays} days we aim to at least{" "}
            <strong className="text-white">double</strong> that product’s
            revenue versus your prior {GUARANTEE.baselineDays}-day baseline. If
            you run the path in good faith and miss, we refund Make it RAIN
            subscription fees you paid in the window.
          </p>
          <TrackedLink
            href="/signup"
            trackTarget="guarantee_body_signup"
            className="btn-primary mt-5 inline-flex !px-6 !py-3"
          >
            Start free
          </TrackedLink>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">
            1. Tailored customer playbook
          </h2>
          <p className="text-slate-300">
            Built from your product URL and/or description (optional GitHub /
            docs). Customized to your offer and stage — plain language, serious
            commercial detail. It includes at minimum:
          </p>
          <ul className="rain-list mt-2 space-y-2 text-slate-300">
            <li>Commercial brief with evidence grades</li>
            <li>Who may pay (buyer direction)</li>
            <li>What to charge (pricing direction)</li>
            <li>What to do this week</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">2. Baseline revenue</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>
              Baseline = money your product received in the{" "}
              {GUARANTEE.baselineDays} days before your guarantee window starts
              (Stripe, App Store, invoices, or equivalent).
            </li>
            <li>Provide a simple export or screenshots if you claim.</li>
            <li>
              Pure friends-and-family gifts may be excluded if they are not real
              product sales.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">3. What “2×” means</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>
              Success = product revenue in the {GUARANTEE.windowDays}-day window
              is at least <strong className="text-white">2×</strong> baseline.
            </li>
            <li>
              If baseline is <strong className="text-white">$0</strong>, 2× is
              $0 mathematically. For a $0 baseline, after a good-faith path, if
              you still have <strong className="text-white">$0</strong> product
              revenue at day {GUARANTEE.windowDays}, you qualify for money back
              on fees paid in the window (see below). Getting from $0 to any
              paid customer also counts as clearing the spirit of the offer for
              that track.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">
            4. Good-faith path (required)
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>Account in good standing.</li>
            <li>Generate the tailored customer playbook for your product.</li>
            <li>Keep a real paid offer live someone could buy.</li>
            <li>
              Send at least {GUARANTEE.minOutreaches} outreach messages to real
              prospects during the window (or an agreed equivalent we confirm in
              writing).
            </li>
            <li>
              Window starts when you mark path-start in-product or, if we agree
              in writing, on your trial start date.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">5. Money back</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>
              Refund = Make it RAIN <strong className="text-white">subscription
              fees you paid</strong> during the guarantee window (Starter /
              Growth / Pro).
            </li>
            <li>
              If you paid <strong className="text-white">$0</strong> (free
              account only, never converted), there is no subscription to
              refund.
            </li>
            <li>Not a cash prize above fees paid. Not ad spend. Not CAC.</li>
            <li>One claim per person / product / year.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">6. What this is not</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-300">
            <li>Not a promise of ongoing profit or valuation.</li>
            <li>Not for fake products, empty outreach, or gamed baselines.</li>
            <li>
              We may decline abuse or change terms for new signups; your claim
              uses terms published when your window started.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-3 text-sm leading-relaxed text-slate-400">
          <h2 className="text-lg font-bold text-white">7. How to claim</h2>
          <p className="text-slate-300">
            Email{" "}
            <a
              href="mailto:support@makeitrainapp.com"
              className="text-aqua underline"
            >
              support@makeitrainapp.com
            </a>{" "}
            with subject “Guarantee claim,” account email, baseline proof,
            day-{GUARANTEE.windowDays} revenue proof, and outreach evidence. We
            respond within several business days.
          </p>
          <p className="text-xs text-slate-500">
            Also see{" "}
            <Link href="/terms" className="underline hover:text-slate-300">
              Terms
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
