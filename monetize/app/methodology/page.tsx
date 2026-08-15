import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { GUARANTEE } from "@/lib/guarantee";

export const metadata: Metadata = {
  title: "How the First Customer Path works",
  description:
    "Make it RAIN methodology: find who may pay, warm network + Demand Radar, evidence grades, next revenue move, and what the system does not claim.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <TrackedLink
          href="/signup"
          trackTarget="methodology_cta_signup"
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          {GUARANTEE.cta}
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 text-left">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Methodology
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          How the {GUARANTEE.baitName} works
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Make it RAIN helps you move a product you already built toward better
          customer conversations and a paid yes. Analysis alone is free
          elsewhere. The useful path is: hard commercial answer → who to talk
          to (warm network first, Demand Radar when useful) → prep → Results
          learns. The score is a secondary compass, not the product.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">The conversation path</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>
              <strong className="text-white">Hard commercial answer</strong> —
              one primary buyer, valuable pain, smallest paid offer, honesty if
              the wedge is unclear, and what would disprove it
            </li>
            <li>
              <strong className="text-white">Warm network</strong> — people you
              already know who might fit the buyer. First customers usually come
              from here, not from a tool alone
            </li>
            <li>
              <strong className="text-white">Daily Market Research</strong> —
              one run across 25+ public communities for pain or purchase
              intent; why each signal matters; draft outreach you approve. Not
              a promise of guaranteed buyers
            </li>
            <li>
              <strong className="text-white">{GUARANTEE.baitName}</strong> —
              ~10 ranked conversations + prep. Controllable deliverable: who to
              talk to and what to say. Not a guaranteed sale
            </li>
            <li>
              <strong className="text-white">Results learns</strong> — log
              contacts, replies, objections, revenue; recommendations update
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">
            What the score is (secondary)
          </h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            <li>
              A directional estimate of commercial readiness based on the
              product brief and evidence you supply
            </li>
            <li>
              Paired with a confidence level that rises when more public
              evidence is available
            </li>
            <li>Never the reason to signup. Never the homepage hero</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Evidence grades</h2>
          <p className="mt-2 text-sm text-slate-300">
            Claims are labeled observed, founder-reported, or assumed. That is
            how we build trust without fake certainty or invented testimonials.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">What we do not claim</h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            <li>AI that closes deals for you</li>
            <li>Guaranteed buyers from Reddit or any channel</li>
            <li>Continuous multi-platform buyer monitoring (yet)</li>
            <li>That personas alone equal validated demand</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Guarantee</h2>
          <p className="mt-2 text-sm text-slate-300">
            {GUARANTEE.hook}. {GUARANTEE.hookSecondary}. Full terms on{" "}
            <Link href="/guarantee" className="text-aqua hover:text-aqua-bright">
              /guarantee
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-rain/40 bg-rain/10 px-5 py-6">
          <p className="text-sm text-slate-300">
            Ready for the free {GUARANTEE.baitName}?
          </p>
          <TrackedLink
            href="/signup"
            trackTarget="methodology_body_signup"
            className="btn-primary mt-4 inline-flex !px-6 !py-3"
          >
            {GUARANTEE.cta}
          </TrackedLink>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
