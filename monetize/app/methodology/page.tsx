import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";

export const metadata: Metadata = {
  title: "How the commercial score works",
  description:
    "Make it RAIN methodology: directional scores, confidence, evidence grades (observed, founder-reported, assumed), and what the system does not claim.",
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
          Start free
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 text-left">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Methodology
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          How the commercial score works
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Make it RAIN produces a commercialization brief for a product you
          already built. The score is a compass, not a crystal ball. This page
          explains what it is, what it is not, and how evidence is labeled.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">What the score is</h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            <li>
              A directional estimate of commercial readiness based on the
              product brief and evidence you supply
            </li>
            <li>
              Paired with a confidence level that rises when more public
              evidence is available
            </li>
            <li>
              Meant to surface gaps, ranked paths, kill criteria, and a
              this-week test
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">What it is not</h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            <li>Not a guarantee of revenue or valuation</li>
            <li>Not an independent market or financial audit</li>
            <li>Not fake precision (no pretending a 67.4 means science)</li>
            <li>Not a substitute for talking to real buyers</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Evidence grades</h2>
          <p className="mt-2 text-sm text-slate-400">
            Claims in the brief are labeled so you can see rigor vs polish.
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <dt className="font-bold text-emerald-200">Observed</dt>
              <dd className="mt-1 text-slate-300">
                Grounded in public URL scrape, GitHub README, uploaded docs, or
                firmographic enrichment for named competitors.
              </dd>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3">
              <dt className="font-bold text-sky-200">Founder-reported</dt>
              <dd className="mt-1 text-slate-300">
                Taken from what you entered (description, traction, checklist
                answers). Treated as your report, not independently verified.
              </dd>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <dt className="font-bold text-amber-100">Assumed</dt>
              <dd className="mt-1 text-slate-300">
                Model inference without direct evidence. These are hypotheses to
                test, not facts.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">How confidence moves</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            More specific product context, a public product URL, traction
            detail, and named competitors generally increase confidence. Thin
            briefs and vague claims keep confidence lower on purpose.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">
            What you should do with the output
          </h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            <li>Treat ranked paths as options to pressure-test</li>
            <li>Run the this-week actions or rewrite them to fit your calendar</li>
            <li>Use kill criteria so you do not polish forever</li>
            <li>Share the brief with a cofounder; argue with the assumptions</li>
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-night-800/80 px-5 py-5">
          <h2 className="text-base font-bold text-white">Who stands behind it</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Built by{" "}
            <a
              href="https://reliableainetwork.com/"
              className="font-semibold text-aqua hover:text-aqua-bright"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reliable AI Network
            </a>{" "}
            (production AI / SaaS) with{" "}
            <a
              href="https://innovativemarketingb2b.com/"
              className="font-semibold text-aqua hover:text-aqua-bright"
              target="_blank"
              rel="noopener noreferrer"
            >
              Innovative Marketing Solutions
            </a>{" "}
            (B2B revenue operators). You keep ownership of your product and
            code.
          </p>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <TrackedLink
            href="/sample"
            trackTarget="methodology_sample"
            className="btn-primary inline-flex items-center justify-center !px-6 !py-3"
          >
            See a sample brief
          </TrackedLink>
          <TrackedLink
            href="/signup"
            trackTarget="methodology_signup"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-aqua/50"
          >
            Get your playbook free
          </TrackedLink>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500 sm:text-left">
          <Link href="/" className="underline hover:text-slate-400">
            Homepage
          </Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-slate-400">
            Privacy
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
