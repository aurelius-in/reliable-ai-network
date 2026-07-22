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
            className="btn-primary whitespace-nowrap !px-4 !py-2 text-sm"
          >
            Start Trial
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="fade-up rounded-full bg-aqua/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-aqua ring-1 ring-aqua/30">
          The Monetization OS for AI Creators
        </p>
        <h1 className="fade-up mt-6 text-2xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          You built something.
          <br />
          <span className="gradient-text gradient-text-live">Make it RAIN now!</span>
        </h1>
        <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Stop guessing. Use what top sellers do.
        </p>

        <div className="fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="btn-primary glow-card !px-8 !py-4 text-lg"
          >
            Start free 30-day trial <ArrowRight size={20} />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
          >
            See pricing
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
              className="card p-6 transition hover:border-aqua/40 hover:shadow-[0_0_24px_rgba(0,229,255,0.12)]"
            >
              {f.icon}
              <h3 className="mt-3 font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Make it RAIN ·{" "}
        <a
          href="https://MakeItRainApp.com"
          className="transition hover:text-slate-300"
        >
          MakeItRainApp.com
        </a>
      </footer>
    </div>
  );
}
