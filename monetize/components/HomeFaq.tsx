"use client";

import { trackUiClick } from "@/lib/track";
import { CopySwap } from "@/components/CopySwap";

const FAQS: {
  id: string;
  q: string;
  qMobile?: string;
  a: string;
  aMobile: string;
}[] = [
  {
    id: "faq_what_it_is",
    q: "What is Make it RAIN?",
    a: "A guided monetization system for people who built something real. Find who pays, what to charge, attention without a big ad budget, and a path to a paid yes across 15+ tools that share one product brief and evidence trail.",
    aMobile:
      "Monetization system for people who built something real. Who pays, price, attention, path to paid. 15+ tools, one brief.",
  },
  {
    id: "faq_free_score",
    q: "What do I get if I sign up free right now?",
    qMobile: "What do I get free right now?",
    a: "Your tailored customer playbook as a shareable brief: likely buyers, revenue paths, kill criteria, a this-week plan, and claims labeled observed, founder-reported, or assumed. Paste a product URL (and optionally GitHub or a short doc) for a sharper brief. No card required. Download it or send a private link to a cofounder or advisor.",
    aMobile:
      "Your playbook as a shareable brief: buyers, paths, kill criteria, this-week plan. URL/docs optional. No card.",
  },
  {
    id: "faq_first_dollar",
    q: "Will this help me get paying customers?",
    qMobile: "Help getting paying customers?",
    a: "That is the point: buyers, price, offer, scripts, and a path aimed at a paid yes — whether you are opening a new motion or tightening one that already exists. Guarantee details at /guarantee.",
    aMobile:
      "Buyers, price, offer, scripts, path to paid. New motion or tighter one. /guarantee",
  },
  {
    id: "faq_guarantee",
    q: "What is the guarantee?",
    qMobile: "Guarantee?",
    a: "Tailored customer playbook + 2× revenue in 60 days — or your money back (subscription fees paid in the window). Baseline, effort path, and $0-baseline rules are at /guarantee.",
    aMobile:
      "Tailored playbook + 2× in 60 days — or money back. Terms: /guarantee",
  },
  {
    id: "faq_no_ads",
    q: "I have no marketing budget. Is this still for me?",
    qMobile: "No marketing budget. Still for me?",
    a: "Yes. The system is built for founders who cannot (or will not) burn thousands on ads: organic channels, outbound scripts, community/content sprints, and validation that fits a thin calendar.",
    aMobile:
      "Yes. Organic channels, outbound, content sprints, and thin-calendar validation.",
  },
  {
    id: "faq_not_app_builder",
    q: "Does Make it RAIN build my app or own my code?",
    qMobile: "Do you build or own my app?",
    a: "No. We do not build, host, or take ownership of your software. You bring a product you own. We help with the commercial side.",
    aMobile:
      "No. We don’t build, host, or own your software. You keep it. We help you monetize.",
  },
];

export function HomeFaq() {
  return (
    <section id="faq" className="fade-up mt-8 w-full max-w-2xl scroll-mt-24 text-left sm:mt-10">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        FAQ
      </p>
      <h2 className="mt-1.5 text-center text-lg font-bold text-white sm:mt-2 sm:text-2xl">
        <CopySwap
          mobile="Quick answers"
          desktop="Clear answers before you start"
          block
        />
      </h2>
      <div className="mt-4 space-y-2 sm:mt-6">
        {FAQS.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-white/10 bg-night-800/70 px-3.5 py-2.5 open:border-aqua/30 sm:px-4 sm:py-3"
            onToggle={(e) => {
              const el = e.currentTarget;
              if (el.open) trackUiClick(item.id);
            }}
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                <CopySwap mobile={item.qMobile ?? item.q} desktop={item.q} />
                <span className="shrink-0 text-aqua transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:mt-2.5">
              <CopySwap mobile={item.aMobile} desktop={item.a} />
            </p>
          </details>
        ))}
      </div>
      <div className="mt-5 text-center sm:mt-6">
        <a
          href="/signup"
          onClick={() => trackUiClick("faq_cta_signup")}
          className="text-sm font-semibold text-aqua hover:text-aqua-bright"
        >
          <CopySwap
            mobile="Get my playbook free →"
            desktop="Ready? Get my tailored playbook free →"
          />
        </a>
      </div>
    </section>
  );
}
