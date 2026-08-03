import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TrackedLink } from "@/components/TrackedLink";
import { SiteFooter } from "@/components/SiteFooter";
import { CHECKLIST_QUESTIONS } from "@/lib/checklist";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Product Monetization Checkup",
  description:
    "10 questions for software and AI founders before turning a finished product into revenue. Free checkup from Make it RAIN.",
  alternates: { canonical: "/checklist" },
  openGraph: {
    title: "Product Monetization Checkup | Make it RAIN",
    description:
      "Ten questions every technical founder should answer before (or right after) launch.",
  },
};

export default function ChecklistPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <TrackedLink
          href="/pricing"
          trackTarget="checklist_page_trial"
          className="btn-primary !px-4 !py-2 text-sm"
        >
          Start free trial
        </TrackedLink>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-aqua">
          Free checkup
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          Product Monetization Checkup
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-300">
          Ten questions for technical founders who shipped a product but still
          need a clear path to buyers, pricing, launch, and sales. Be honest.
          The gaps you name here are usually the ones Make it RAIN is built to
          close.
        </p>

        <ol className="mt-8 space-y-4">
          {CHECKLIST_QUESTIONS.map((item, i) => (
            <li
              key={item.q}
              className="rounded-xl border border-white/10 bg-night-800/80 px-5 py-4"
            >
              <p className="text-sm font-black text-aqua">Question {i + 1}</p>
              <p className="mt-1 text-lg font-bold text-white">{item.q}</p>
              <p className="mt-2 text-sm text-slate-400">{item.why}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl border border-aqua/25 bg-aqua/10 px-5 py-6">
          <h2 className="text-xl font-bold text-white">
            Want the guided path instead of another blank doc?
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Make it RAIN is a monetization system for products you already own,
            not an app builder. It walks you from a finished product to paying
            customers: buyers, positioning, pricing, offer, launch, sales, and
            what to fix next.
          </p>
          <TrackedLink
            href="/pricing"
            trackTarget="checklist_page_cta"
            className="btn-primary mt-4 inline-flex items-center gap-2 !px-6 !py-3"
          >
            Start free trial <ArrowRight size={18} />
          </TrackedLink>
          <p className="mt-3 text-xs text-slate-500">
            30-day free trial on the plan you choose. Cancel anytime.
          </p>
          <p className="mt-4 text-sm">
            <Link href="/" className="font-semibold text-aqua hover:text-aqua-bright">
              ← Back to Make it RAIN
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
