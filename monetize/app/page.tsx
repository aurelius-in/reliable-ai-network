import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeDollarSign, Lightbulb, Rocket } from "lucide-react";
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
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-electric to-electric-bright px-4 py-2 font-bold text-white shadow shadow-electric/30 transition hover:brightness-110"
          >
            Start free trial
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="fade-up rounded-full bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold ring-1 ring-gold/30">
          The Monetization OS for AI Creators
        </p>
        <h1 className="fade-up mt-6 text-4xl font-black leading-tight text-white sm:text-6xl">
          You built something with AI.
          <br />
          <span className="gradient-text">Now make it rain.</span>
        </h1>
        <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Stop guessing how to make money from your AI creation. Get the exact
          frameworks top marketers use — offer design, pricing, funnels — analyzed
          and generated for <em>your</em> product in minutes.
        </p>

        <div className="fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="glow-card inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-electric-bright px-8 py-4 text-lg font-bold text-white transition hover:brightness-110"
          >
            Start your free 30-day Pro trial <ArrowRight size={20} />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
          >
            See pricing →
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Full Pro access. Cancel anytime. No auto-downgrade.
        </p>

        <div className="mt-20 grid w-full gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: <Lightbulb className="text-electric-bright" size={22} />,
              title: "Idea Analyzer",
              body: "Get a monetization score, your best revenue paths, and quick wins — in one run.",
            },
            {
              icon: <BadgeDollarSign className="text-gold" size={22} />,
              title: "Pricing Builder",
              body: "Value-based price ranges and high-converting sales copy, tailored to what you built.",
            },
            {
              icon: <Rocket className="text-electric-bright" size={22} />,
              title: "Launch Templates",
              body: "Gumroad descriptions, email sequences, landing page outlines. Fill in, ship today.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-night-600 bg-night-700 p-6 transition hover:border-electric/40"
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
