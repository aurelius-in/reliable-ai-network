import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ExitSurvey } from "@/components/ExitSurvey";
import { TrackedLink } from "@/components/TrackedLink";
import { SAMPLE_BRIEF } from "@/lib/sample-brief";
import { DEFAULT_REVIEWER_INVITE_PATH } from "@/lib/invite-tokens";

export const metadata: Metadata = {
  title: "Sample monetization brief | Make it RAIN",
  description:
    "Illustrative commercialization brief showing score, evidence grades, buyers, pricing logic, kill criteria, and this-week actions. Labeled sample, not a live audit.",
  alternates: { canonical: "/sample" },
};

const GRADE_STYLE = {
  observed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  founder_reported: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  assumed: "border-amber-500/40 bg-amber-500/10 text-amber-100",
} as const;

export default function SampleBriefPage() {
  const s = SAMPLE_BRIEF;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <TrackedLink
          href="/signup"
          trackTarget="sample_cta_signup"
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          Get yours free
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <strong className="font-semibold">Illustrative sample.</strong> Not a
          live audit of a real customer. Shows the shape of a Make it RAIN
          commercialization brief, including how evidence grades appear.
        </p>

        <article className="mt-6 rounded-2xl border border-white/10 bg-night-800/90 px-5 py-7 sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            Sample Monetization Brief
          </p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            {s.productTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {s.productType} · {s.stage}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            {s.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
            <div className="rounded-2xl border border-rain/40 bg-rain/10 px-6 py-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Directional score
              </p>
              <p className="mt-1 text-5xl font-black text-white">{s.score}</p>
              <p className="mt-1 text-sm font-semibold text-aqua">
                Confidence: {s.confidence}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{s.scoreNote}</p>
          </div>

          <h2 className="mt-10 text-lg font-bold text-white">Evidence grades</h2>
          <ul className="mt-3 space-y-3">
            {s.evidence.map((e) => (
              <li
                key={e.claim}
                className="rounded-xl border border-white/10 bg-night-900/60 px-4 py-3"
              >
                <span
                  className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${GRADE_STYLE[e.grade]}`}
                >
                  {e.grade.replace("_", " ")}
                </span>
                <p className="mt-2 text-sm text-slate-300">{e.claim}</p>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-lg font-bold text-white">Revenue paths</h2>
          <ul className="mt-3 space-y-3">
            {s.paths.map((p) => (
              <li key={p.name} className="text-sm text-slate-300">
                <span className="font-semibold text-white">{p.name}.</span>{" "}
                {p.why}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-lg font-bold text-white">Buyers</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.buyers}</p>

          <h2 className="mt-8 text-lg font-bold text-white">Pricing logic</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.price}</p>

          <h2 className="mt-8 text-lg font-bold text-white">
            First-dollar offer
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {s.firstDollar}
          </p>

          <h2 className="mt-8 text-lg font-bold text-white">Kill criteria</h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            {s.killCriteria.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-lg font-bold text-white">This week</h2>
          <ul className="rain-list mt-3 space-y-2 text-sm text-slate-300">
            {s.thisWeek.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </article>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <TrackedLink
            href="/signup"
            trackTarget="sample_get_yours"
            className="btn-primary inline-flex items-center justify-center !px-6 !py-3.5"
          >
            Get a brief for your product
          </TrackedLink>
          <TrackedLink
            href={DEFAULT_REVIEWER_INVITE_PATH}
            trackTarget="sample_to_invite"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:border-aqua/50"
          >
            I was invited as a reviewer
          </TrackedLink>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href="/methodology" className="underline hover:text-slate-400">
            How scoring works
          </Link>
          {" · "}
          <Link href="/" className="underline hover:text-slate-400">
            Homepage
          </Link>
        </p>
      </main>

      <ExitSurvey source="sample" />
      <SiteFooter />
    </div>
  );
}
