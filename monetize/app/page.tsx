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
import { PublicExampleBriefs } from "@/components/PublicExampleBriefs";
import { CopySwap } from "@/components/CopySwap";
import { JsonLd } from "@/components/JsonLd";
import { createClient } from "@/lib/supabase/server";
import { GUARANTEE } from "@/lib/guarantee";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL || "https://makeitrainapp.com"
).replace(/\/$/, "");

const TITLE =
  "You built something real. Now it's time to get paid. Make it RAIN.";
const DESCRIPTION =
  "Find who may pay, stress-test the offer, and figure out the next conversation worth having. Paste your URL. See a commercial result before you create an account.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "first paying customer",
    "who may pay",
    "find buyers for SaaS",
    "software monetization",
    "SaaS go-to-market",
    "monetize my app",
    "pricing for indie hackers",
    "first dollar SaaS",
    "shareable monetization brief",
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

const TENK_MENU = [
  { item: "Go-to-market plan", via: "fractional CMO", price: "$5k–$20k/mo" },
  { item: "Buyer research + named leads", via: "agency", price: "$3k+/mo" },
  { item: "Pricing strategy", via: "consultant", price: "$200–$500/hr" },
  { item: "Launch + funnel plan", via: "performance agency", price: "$7k–$20k/mo" },
  { item: "Personalized posts, newsletters & DMs", via: "marketing agency", price: "$3k–$25k/mo" },
];

const HOW_STEPS = [
  {
    n: "1",
    title: "Paste the product you already shipped",
    body: "URL in. Four commercial findings before an account. Save to run the full First Customer Path.",
    bodyMobile: "Paste your URL. Result first. Then save for the full path.",
  },
  {
    n: "2",
    title: "Buyer Stress Test",
    body: "The mechanism: does this offer survive a hard buyer before you spend another week promoting it. Unique to Make it RAIN.",
    bodyMobile: "Does the offer survive a hard buyer. Unique.",
  },
  {
    n: "3",
    title: "The next conversation worth your hour",
    body: "Warm network first. Public conversations when they help. Why this person, why now, why they might trust you.",
    bodyMobile: "Warm first. Public signals when they help. Why now.",
  },
  {
    n: "4",
    title: "What the reply changes",
    body: "Stop forgetting who replied, why they objected, and what that tells you to change about buyer, price, or next move.",
    bodyMobile: "A reply should change who you sell to, or what you do next.",
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
            {GUARANTEE.cta}
          </TrackedLink>
        </nav>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-12 pt-6 text-center sm:pb-14 sm:pt-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.14),transparent_70%)]"
          aria-hidden
        />

        <p className="fade-up text-[11px] font-bold uppercase tracking-[0.16em] text-aqua sm:text-xs sm:tracking-[0.18em]">
          For people who already shipped
        </p>
        <Suspense fallback={null}>
          <HomeHero />
        </Suspense>

        <PublicExampleBriefs />

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
            <p className="text-center text-xs text-slate-500 sm:text-sm">
              {GUARANTEE.hookSecondary}
            </p>
            <span
              aria-hidden
              className="h-px w-16 bg-gradient-to-r from-transparent via-aqua/60 to-transparent transition group-hover:via-aqua sm:w-24"
            />
          </Link>
        </section>

        <section
          id="trust"
          className="fade-up mt-6 w-full max-w-2xl text-left sm:mt-8"
        >
          <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            Trust while we earn customers
          </p>
          <ul className="mt-3 grid gap-2 text-left text-sm text-slate-300 sm:grid-cols-2">
            <li className="rounded-xl border border-white/10 bg-night-800/70 px-3 py-2.5">
              <span className="font-semibold text-white">Sample brief</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                Illustrative format, plus live examples with names redacted.{" "}
                <Link href="/sample" className="text-aqua hover:text-aqua-bright">
                  Open sample
                </Link>
                {" · "}
                <Link href="/#examples" className="text-aqua hover:text-aqua-bright">
                  Real examples
                </Link>
              </span>
            </li>
            <li className="rounded-xl border border-white/10 bg-night-800/70 px-3 py-2.5">
              <span className="font-semibold text-white">Not your own AI hype</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                Observed vs assumed. Protection from believing a generated plan.
              </span>
            </li>
            <li className="rounded-xl border border-white/10 bg-night-800/70 px-3 py-2.5">
              <span className="font-semibold text-white">Methodology</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                How we decide.{" "}
                <Link
                  href="/methodology"
                  className="text-aqua hover:text-aqua-bright"
                >
                  Read it
                </Link>
              </span>
            </li>
            <li className="rounded-xl border border-white/10 bg-night-800/70 px-3 py-2.5">
              <span className="font-semibold text-white">No fake logos</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                We do not invent testimonials. Process proof first.
              </span>
            </li>
          </ul>
        </section>

        <section
          id="first-win"
          className="fade-up mt-8 w-full max-w-2xl scroll-mt-24 rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 via-night-800/95 to-night-800 px-4 py-5 text-left sm:mt-10 sm:px-6 sm:py-7"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rain-bright">
            Free · {GUARANTEE.baitName}
          </p>
          <h2 className="mt-1.5 text-xl font-black text-white sm:mt-2 sm:text-3xl">
            Find who may pay, what to charge, and what to do next
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Paste a URL. See a commercial result before you create an account.
            Then save for a {GUARANTEE.baitName} another firm would charge
            hundreds for:
          </p>
          <ul className="rain-list mt-2.5 space-y-2 text-sm text-slate-200 sm:mt-3">
            <li>One buyer who may actually pay</li>
            <li>One paid offer and a price to test</li>
            <li>
              Buyer Stress Test{" "}
              <span className="text-slate-500">
                (does it survive a hard buyer before another week of promotion)
              </span>
            </li>
            <li>The next conversation worth your hour</li>
            <li>What to say (drafts you approve)</li>
          </ul>
          <p className="mt-3 text-sm text-slate-300">
            <span className="font-semibold text-white">Why free?</span> If this
            is free, the paid path should feel obvious. You get the brief. We
            learn what the market actually does.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            No card. No guaranteed-sale nonsense. {GUARANTEE.hook}
          </p>
          <div className="mt-4 flex flex-col items-stretch gap-2.5 sm:mt-5 sm:flex-row sm:items-center">
            <TrackedLink
              href="#home-product-url"
              trackTarget="first_win_cta_signup"
              className="btn-primary glow-card inline-flex w-full items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:w-auto sm:!py-4 sm:text-lg"
            >
              Run it on my product, free <ArrowRight size={20} />
            </TrackedLink>
            <TrackedLink
              href="/sample"
              trackTarget="first_win_cta_sample"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-aqua/50 hover:bg-aqua/10 sm:px-6"
            >
              See a sample
            </TrackedLink>
            <TrackedLink
              href="/#examples"
              trackTarget="first_win_cta_examples"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-aqua/50 hover:bg-aqua/10 sm:px-6"
            >
              Real examples
            </TrackedLink>
          </div>
        </section>

        <section className="fade-up mt-8 w-full max-w-2xl text-left sm:mt-10">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
            How it works
          </p>
          <h2 className="mt-1.5 text-center text-lg font-bold text-white sm:mt-2 sm:text-2xl">
            Desire, then the mechanism
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

        <details className="group mt-8 w-full max-w-2xl scroll-mt-24 text-left sm:mt-10">
          <summary className="cursor-pointer list-none rounded-xl border border-white/10 bg-night-800/70 px-3.5 py-3 text-center marker:content-none group-open:border-aqua/30 sm:px-4 sm:py-3.5 [&::-webkit-details-marker]:hidden">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              Optional depth
            </p>
            <h2 className="mt-1.5 flex items-center justify-center gap-2 text-lg font-bold text-white sm:text-2xl">
              First Customer Path, then the jobs that close
              <span className="text-aqua transition group-open:rotate-45">+</span>
            </h2>
            <p className="mx-auto mt-1.5 max-w-xl text-sm text-slate-400">
              <CopySwap
                mobile="Open for research, writers, launch, DMs."
                desktop="Open for depth after the path: research, writers, pipeline, site, results."
              />
            </p>
          </summary>
          <div className="mt-4">
            <MarketingJourneyPie />
            <div className="mt-5 text-center sm:mt-6">
              <TrackedLink
                href="/signup"
                trackTarget="pie_cta_signup"
                className="btn-primary inline-flex items-center justify-center gap-2 !px-6 !py-3 text-base"
              >
                {GUARANTEE.cta} <ArrowRight size={18} />
              </TrackedLink>
            </div>
          </div>
        </details>

        <HomeDepth />

        <details
          id="tenk-menu"
          className="group fade-up mt-8 w-full max-w-2xl scroll-mt-24 text-left sm:mt-10"
        >
          <summary className="cursor-pointer list-none rounded-xl border border-white/10 bg-night-800/70 px-3.5 py-3 text-center marker:content-none group-open:border-aqua/30 sm:px-4 sm:py-3.5 [&::-webkit-details-marker]:hidden">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
              Optional later proof
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-white sm:text-2xl">
              What this work costs à la carte
              <span className="ml-2 text-aqua transition group-open:rotate-45">+</span>
            </h2>
            <p className="mx-auto mt-1.5 max-w-lg text-xs text-slate-400 sm:text-sm">
              Hiring it out is not the first comparison. Another unpaid month is.
            </p>
          </summary>
          <ul className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-night-800/70 sm:mt-5">
            {TENK_MENU.map((row) => (
              <li
                key={row.item}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5 sm:py-3"
              >
                <span className="text-sm text-slate-200">
                  {row.item}{" "}
                  <span className="hidden text-xs text-slate-500 sm:inline">
                    · {row.via}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-400">
                  {row.price}
                </span>
              </li>
            ))}
            <li className="flex flex-col gap-1 px-4 py-3 sm:py-3.5">
              <span className="text-sm font-bold text-white">Make it RAIN</span>
              <span className="text-sm text-slate-300">
                Serious commercial work. Free First Customer Path. Plans from
                $29/mo after you see the brief.
              </span>
            </li>
          </ul>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Typical published 2025–26 U.S. market rates.
          </p>
        </details>

        <HomeFaq />

        <div className="fade-up mt-8 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <TrackedLink
            href="/signup"
            trackTarget="footer_cta_signup"
            className="btn-primary glow-card inline-flex items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:!px-8 sm:!py-4 sm:text-lg"
          >
              {GUARANTEE.ctaLong} <ArrowRight size={20} />
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
          Free. No card.{" "}
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
