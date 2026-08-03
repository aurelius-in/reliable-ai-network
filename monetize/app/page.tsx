import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TrackedLink } from "@/components/TrackedLink";
import { MarketingJourneyPie } from "@/components/MarketingJourneyPie";
import { SiteFooter } from "@/components/SiteFooter";
import { HomeFaq } from "@/components/HomeFaq";
import { HomeDepth } from "@/components/HomeDepth";
import { HomeHero } from "@/components/HomeHero";
import { HomeChat } from "@/components/HomeChat";
import { CopySwap } from "@/components/CopySwap";
import { JsonLd } from "@/components/JsonLd";
import { createClient } from "@/lib/supabase/server";
import { GUARANTEE } from "@/lib/guarantee";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL || "https://makeitrainapp.com"
).replace(/\/$/, "");

const TITLE =
  "Make it RAIN | Tailored customer playbook for the product you already built";
const DESCRIPTION =
  "A tailored customer playbook for the product you built: who may pay, what to charge, and what to do this week. Free to start. Shareable brief with evidence grades.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "software monetization",
    "SaaS go-to-market",
    "monetize my app",
    "pricing for indie hackers",
    "AI product launch",
    "find buyers for SaaS",
    "first dollar SaaS",
    "shareable monetization brief",
    "SaaS commercial score",
  ],
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Make it RAIN",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const HOW_STEPS = [
  {
    n: "1",
    title: "Get your playbook free",
    body: "Paste a URL or describe your product. Get your playbook with evidence grades, kill criteria, and a shareable link.",
    bodyMobile: "URL or brief → playbook, evidence grades, shareable link.",
  },
  {
    n: "2",
    title: "Lock buyer, price, offer",
    body: "Who pays, what to charge, and the smallest offer worth selling.",
    bodyMobile: "Who pays, what to charge, smallest paid offer.",
  },
  {
    n: "3",
    title: "Run this week",
    body: "Copy-ready posts, DMs, funnel stages, and a sprint sized for no ad budget.",
    bodyMobile: "Posts, DMs, funnel, sprint. No ad budget needed.",
  },
  {
    n: "4",
    title: "Measure and tighten",
    body: "See what’s leaking, what to test next, and whether to push, pivot, or stop.",
    bodyMobile: "Find the leak. Push, pivot, or stop.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Make it RAIN",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE,
    description: DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free account to start, then 30-day trial on paid plans",
    },
    publisher: {
      "@type": "Organization",
      name: "Reliable AI Network, LLC",
      url: "https://reliableainetwork.com/",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={jsonLd} />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link href="/pricing" className="text-slate-300 transition hover:text-white">
            Pricing
          </Link>
          <Link href="/login" className="text-slate-300 transition hover:text-white">
            Login
          </Link>
          <TrackedLink
            href="/signup"
            trackTarget="nav_start_trial"
            className="btn-primary whitespace-nowrap !px-3 !py-2 text-sm sm:!px-4"
          >
            Start free
          </TrackedLink>
        </nav>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-12 pt-6 text-center sm:pb-14 sm:pt-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.14),transparent_70%)]"
          aria-hidden
        />

        <p className="fade-up text-[11px] font-bold uppercase tracking-[0.16em] text-aqua sm:text-xs sm:tracking-[0.18em]">
          You built something real
        </p>
        <h1 className="fade-up mt-3 text-4xl font-black leading-[1.05] tracking-tight text-white sm:mt-4 sm:text-6xl">
          <span className="gradient-text gradient-text-live">Make it RAIN</span>
        </h1>
        <Suspense fallback={null}>
          <HomeHero />
        </Suspense>

        <section
          id="guarantee"
          className="fade-up mt-7 w-full max-w-2xl scroll-mt-24 sm:mt-9"
        >
          <Link
            href="/guarantee"
            className="group mx-auto flex max-w-xl flex-col items-center gap-2.5"
          >
            <span
              aria-hidden
              className="h-px w-16 bg-gradient-to-r from-transparent via-aqua/60 to-transparent transition group-hover:via-aqua sm:w-24"
            />
            <p className="text-center text-base font-bold leading-snug text-white transition group-hover:text-aqua-bright sm:text-xl">
              <CopySwap
                mobile={GUARANTEE.hookMobile}
                desktop={GUARANTEE.hook}
              />
            </p>
            <span
              aria-hidden
              className="h-px w-16 bg-gradient-to-r from-transparent via-aqua/60 to-transparent transition group-hover:via-aqua sm:w-24"
            />
          </Link>
        </section>

        <section
          id="first-win"
          className="fade-up mt-8 w-full max-w-2xl scroll-mt-24 rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 via-night-800/95 to-night-800 px-4 py-5 text-left sm:mt-10 sm:px-6 sm:py-7"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rain-bright">
            Start here. Free.
          </p>
          <h2 className="mt-1.5 text-xl font-black text-white sm:mt-2 sm:text-3xl">
            Your tailored customer playbook
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            <CopySwap
              mobile="Free account. URL or short description. Built around your product:"
              desktop="Create a free account. Paste a product URL or describe what you own. Optionally add public GitHub or a short doc. The playbook is built for your product:"
            />
          </p>
          <ul className="rain-list mt-2.5 space-y-2 text-sm text-slate-200 sm:mt-3">
            <li>Commercial score with confidence</li>
            <li>Evidence grades: observed vs assumed</li>
            <li>Revenue paths ranked for your product</li>
            <li>Kill criteria + this-week plan</li>
            <li>Shareable brief (download or link)</li>
          </ul>
          <p className="mt-2.5 text-sm text-slate-300 sm:mt-3">
            <CopySwap
              mobile="Then: buyers, pricing, funnel, launch, sales. Card only on a paid plan trial."
              desktop="Then unlock buyers, pricing, funnel, traffic, launch, and sales. Card only when you pick a plan for the 30-day trial."
            />
          </p>
          <p className="mt-2.5 text-xs text-slate-400 sm:mt-3">
            You keep your product, code, and data. No repo required to start.
          </p>
          <div className="mt-4 flex flex-col items-stretch gap-2.5 sm:mt-5 sm:flex-row sm:items-center">
            <TrackedLink
              href="/signup"
              trackTarget="first_win_cta_signup"
              className="btn-primary glow-card inline-flex w-full items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:w-auto sm:!py-4 sm:text-lg"
            >
              <CopySwap
                mobile="Get my playbook free"
                desktop="Get my tailored playbook"
              />{" "}
              <ArrowRight size={20} />
            </TrackedLink>
            <TrackedLink
              href="/sample"
              trackTarget="first_win_cta_sample"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-aqua/50 hover:bg-aqua/10 sm:px-6"
            >
              See a sample first
            </TrackedLink>
          </div>
        </section>

        <section className="fade-up mt-8 w-full max-w-2xl text-left sm:mt-10">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            How it works
          </p>
          <h2 className="mt-1.5 text-center text-lg font-bold text-white sm:mt-2 sm:text-2xl">
            <CopySwap
              mobile="Product → next money move"
              desktop="From shipped product to the next money move"
              block
            />
          </h2>
          <ol className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2">
            {HOW_STEPS.map((step) => (
              <li
                key={step.n}
                className="flex gap-3 rounded-xl border border-white/10 bg-night-800/70 px-3 py-2.5 sm:px-3.5 sm:py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aqua/15 text-xs font-black text-aqua">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    <CopySwap mobile={step.bodyMobile} desktop={step.body} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 w-full sm:mt-10">
          <div className="mb-4 text-center sm:mb-5">
            <h2 className="text-xl font-black text-white sm:text-3xl">
              15 tools for every money problem
            </h2>
            <p className="mx-auto mt-1.5 max-w-xl text-sm text-slate-400 sm:mt-2">
              <CopySwap
                mobile="Tap a slice. Buyers, price, attention, launch, sales."
                desktop="Hover a slice. Buyers, price, attention, launch, sales, results — one system, not a pile of disconnected chats."
              />
            </p>
          </div>
          <MarketingJourneyPie />
          <div className="mt-5 text-center sm:mt-6">
            <TrackedLink
              href="/signup"
              trackTarget="pie_cta_signup"
              className="btn-primary inline-flex items-center justify-center gap-2 !px-6 !py-3 text-base"
            >
              Open the system free <ArrowRight size={18} />
            </TrackedLink>
          </div>
        </section>

        <HomeDepth />

        <HomeFaq />

        <div className="fade-up mt-8 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <TrackedLink
            href="/signup"
            trackTarget="footer_cta_signup"
            className="btn-primary glow-card inline-flex items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:!px-8 sm:!py-4 sm:text-lg"
          >
            <CopySwap
              mobile="Get my playbook free"
              desktop="Get my tailored playbook"
            />{" "}
            <ArrowRight size={20} />
          </TrackedLink>
          <TrackedLink
            href="/pricing"
            trackTarget="footer_cta_pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-night-600 bg-night-800/80 px-6 py-3.5 text-base font-semibold text-white transition hover:border-aqua/50 sm:px-8 sm:py-4 sm:text-lg"
          >
            See plans
          </TrackedLink>
        </div>
        <p className="mt-2.5 max-w-md text-center text-xs text-slate-500 sm:mt-3">
          <CopySwap
            mobile="Free first. No card."
            desktop="Free first. No card. Cancel anytime. Your product stays yours."
          />{" "}
          <Link
            href="/sample"
            className="font-semibold text-slate-400 underline hover:text-aqua"
          >
            See a sample
          </Link>
        </p>
      </main>

      <HomeChat />
      <SiteFooter />
    </div>
  );
}
