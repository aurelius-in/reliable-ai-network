import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { InviteBootstrap } from "@/components/InviteBootstrap";
import { ExitSurvey } from "@/components/ExitSurvey";
import { TrackedLink } from "@/components/TrackedLink";
import { lookupInviteToken } from "@/lib/invite-tokens";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const invite = lookupInviteToken(token);
  if (!invite) return { title: "Invite" };
  return {
    title: "You're invited to review Make it RAIN",
    description:
      "Complimentary reviewer access. See a sample commercialization brief, or try the workflow. No card. Oliver asked for your judgment on rigor and evidence.",
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invite = lookupInviteToken(token);
  if (!invite) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signupHref = `/signup?invite=${encodeURIComponent(invite.token)}`;
  const primaryHref = user ? "/dashboard?invite=1" : signupHref;
  const primaryLabel = user
    ? "Continue to reviewer dashboard"
    : "Open reviewer access";

  return (
    <div className="flex min-h-screen flex-col">
      <InviteBootstrap accessCode={invite.accessCode} />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <Link
          href="/sample"
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          See a sample first
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Private reviewer invitation
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Oliver invited you to review Make it RAIN
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
          Make it RAIN helps people who already built software decide who may
          pay, what to charge, which offer to test, and what commercial action
          to take next. It is a guided commercialization system, not another
          ChatGPT tab and not an app builder.
        </p>

        <section className="mt-8 rounded-2xl border border-rain/35 bg-gradient-to-br from-rain/10 via-night-800/95 to-night-800 px-5 py-6">
          <h2 className="text-lg font-bold text-white">
            What you can examine
          </h2>
          <ul className="rain-list mt-4 space-y-2.5 text-sm text-slate-200">
            <li>
              A directional commercial readiness score with confidence (not fake
              precision)
            </li>
            <li>
              Evidence labeled observed, founder-reported, or assumed
            </li>
            <li>Ranked revenue paths and a smallest paid offer</li>
            <li>Buyer, pricing, and this-week next tests</li>
            <li>A shareable monetization brief (download or private link)</li>
          </ul>
          <p className="mt-4 text-sm text-slate-400">
            Complimentary Pro reviewer access for {invite.grant.durationDays}{" "}
            days. No payment card. No billing while reviewer access is active.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-night-800/80 px-5 py-5">
          <h2 className="text-base font-bold text-white">
            What Oliver is asking you to assess
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Does the system help founders make evidence-based decisions, or does
            any part produce polished output without enough rigor behind it?
            Positive, negative, and neutral feedback are all welcome.
          </p>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-slate-300">
            <li>Is the promised outcome clear before you commit time?</li>
            <li>Do recommendations show evidence vs assumption?</li>
            <li>Are next actions concrete and testable?</li>
            <li>Where did you hesitate or distrust the experience?</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
            Choose how to review
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <TrackedLink
              href="/sample"
              trackTarget="invite_sample_first"
              className="rounded-2xl border border-white/15 bg-night-800/90 px-5 py-5 text-left transition hover:border-aqua/40"
            >
              <p className="font-bold text-white">See a prepared sample</p>
              <p className="mt-1.5 text-sm text-slate-400">
                Inspect an illustrative brief without entering your own product
                data.
              </p>
            </TrackedLink>
            <TrackedLink
              href={primaryHref}
              trackTarget="invite_open_reviewer"
              className="rounded-2xl border border-rain/40 bg-rain/10 px-5 py-5 text-left transition hover:border-rain/70"
            >
              <p className="font-bold text-white">Open the reviewer experience</p>
              <p className="mt-1.5 text-sm text-slate-300">
                {user
                  ? "Continue into Pro tools. Sample product or your own public URL."
                  : "Create your complimentary account, then try a sample product or your own public URL."}
              </p>
            </TrackedLink>
          </div>
        </section>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <TrackedLink
            href={primaryHref}
            trackTarget="invite_primary_cta"
            className="btn-primary glow-card inline-flex items-center justify-center gap-2 !px-6 !py-3.5 text-base"
          >
            {primaryLabel} <ArrowRight size={18} />
          </TrackedLink>
          <TrackedLink
            href="/sample"
            trackTarget="invite_secondary_sample"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:border-aqua/50"
          >
            See a sample result first
          </TrackedLink>
        </div>

        <ul className="mt-6 space-y-1 text-center text-xs text-slate-500">
          <li>Repository not required. Public URL or short description is enough.</li>
          <li>Do not paste confidential or patient data. Prefer public materials.</li>
          <li>You keep ownership of anything you enter. We do not build or take your software.</li>
        </ul>

        <p className="mt-8 text-center text-sm text-slate-400">
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
          (B2B revenue operators).
        </p>

        <p className="mt-4 text-center text-xs text-slate-600">
          <Link href="/methodology" className="underline hover:text-slate-400">
            How the score works
          </Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-slate-400">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-slate-400">
            Terms
          </Link>
          {" · "}
          <Link href="/" className="underline hover:text-slate-400">
            Public homepage
          </Link>
        </p>
      </main>

      <ExitSurvey source="invite" />
      <SiteFooter />
    </div>
  );
}
