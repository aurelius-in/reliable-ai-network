import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { IntelSurveyForm } from "@/components/IntelSurveyForm";
import {
  INTEL_PRO_REVIEW_HREF,
  INTEL_SAMPLE_BRIEF_HREF,
  intelIntro,
  lookupIntelPerson,
} from "@/lib/intel-cohort";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const person = lookupIntelPerson(token);
  if (!person) return { title: "Feedback" };
  return {
    title: "A 2-minute question | Make it RAIN",
    robots: { index: false, follow: false },
  };
}

export default async function IntelSurveyPage({ params }: Props) {
  const { token } = await params;
  const person = lookupIntelPerson(token);
  if (!person) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <Link
          href="/#examples"
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          See sample output
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Private note from Oliver
        </p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          {person.firstName}, I want the honest version.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          {intelIntro(person)}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={INTEL_SAMPLE_BRIEF_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/10 bg-night-800/80 px-4 py-4 transition hover:border-aqua/40"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-aqua">
              First Customer Path · Free
            </p>
            <p className="mt-1 font-bold text-white">Standard Founder Brief</p>
            <p className="mt-1 text-xs text-slate-400">
              Pet health / records SaaS. Names redacted.
            </p>
          </a>
          <a
            href={INTEL_PRO_REVIEW_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-rain/40 bg-rain/10 px-4 py-4 transition hover:border-rain/70"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rain-bright">
              Available with Pro
            </p>
            <p className="mt-1 font-bold text-white">Pro Review sample</p>
            <p className="mt-1 text-xs text-slate-400">
              Redacted example. Deeper buyer, evidence, risk, and validation
              analysis.
            </p>
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-night-800/90 px-5 py-6 sm:px-6">
          <IntelSurveyForm person={person} loggedIn={Boolean(user)} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
