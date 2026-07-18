import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeDollarSign,
  GitBranch,
  Handshake,
  Layers,
  Lightbulb,
  Megaphone,
  Rocket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-slate-300 transition hover:text-white">
            Pricing
          </Link>
          <Link href="/login" className="text-slate-300 transition hover:text-white">
            Login
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-rain to-rain-bright px-4 py-2 font-bold text-white shadow shadow-rain/30 transition hover:brightness-110"
          >
            Start Trial
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="fade-up rounded-full bg-rain/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rain-bright ring-1 ring-rain/30">
          The Monetization OS for AI Creators
        </p>
        <h1 className="fade-up mt-6 text-2xl font-black leading-tight text-white sm:text-5xl">
          You built something.
          <br />
          <span className="gradient-text">Make it rain NOW!</span>
        </h1>
        <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Stop guessing. Use what top sellers do.
        </p>

        <div className="fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="glow-card inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rain to-rain-bright px-8 py-4 text-lg font-bold text-white transition hover:brightness-110"
          >
            Start free 30-day trial <ArrowRight size={20} />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
          >
            See pricing →
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Full Pro access. Cancel anytime.
        </p>

        <div className="mt-20 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Lightbulb className="text-rain-bright" size={22} />,
              title: "Idea Analyzer",
              body: "See if your idea sells.",
            },
            {
              icon: <Users className="text-pink" size={22} />,
              title: "Find Your Buyers",
              body: "Know who will pay you.",
            },
            {
              icon: <BadgeDollarSign className="text-violet-bright" size={22} />,
              title: "Pricing Builder",
              body: "Pick the right price.",
            },
            {
              icon: <GitBranch className="text-rain-bright" size={22} />,
              title: "Funnel Architect",
              body: "Turn visitors into buyers.",
            },
            {
              icon: <Rocket className="text-pink" size={22} />,
              title: "30-Day Launch Plan",
              body: "One simple step each day.",
            },
            {
              icon: <Megaphone className="text-violet-bright" size={22} />,
              title: "Content Generator",
              body: "Posts and ads written for you.",
            },
            {
              icon: <Handshake className="text-rain-bright" size={22} />,
              title: "Direct Sales Tools",
              body: "Know exactly what to say.",
            },
            {
              icon: <TrendingUp className="text-pink" size={22} />,
              title: "What's Working",
              body: "See what makes you money.",
            },
            {
              icon: <Layers className="text-violet-bright" size={22} />,
              title: "Multiple Ways to Get Paid",
              body: "Find more ways to earn.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-night-600 bg-night-700 p-6 transition hover:border-rain/40 hover:shadow-lg hover:shadow-rain/10"
            >
              {f.icon}
              <h3 className="mt-3 font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-night-600/60 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} RAIN — Reliable AI Network ·{" "}
        <a
          href="https://reliableainetwork.com"
          className="transition hover:text-slate-300"
        >
          reliableainetwork.com
        </a>
      </footer>
    </div>
  );
}
