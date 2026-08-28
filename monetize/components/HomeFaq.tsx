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
    a: "A path from I built it toward someone might actually pay. For technical founders who already shipped. Free First Customer Path: who may pay, Buyer Stress Test, next conversation. Not an app builder. Not another GTM plan.",
    aMobile:
      "Shipped, still not paid. Who may pay, stress-test, next conversation. Not another plan.",
  },
  {
    id: "faq_free_gtm",
    q: "Why not use a free GTM skill in Claude/Cursor?",
    qMobile: "Why not a free GTM skill?",
    a: "Plans and living briefs are getting free. Make it RAIN is for surviving hard buyers, picking who deserves the next hour, and learning what a reply should change. See live examples with names redacted at /#examples. Guarantee: /guarantee.",
    aMobile:
      "Plans are free. MIR stress-tests buyers and names the next conversation. /#examples · /guarantee",
  },
  {
    id: "faq_cheap_operator",
    q: "Why not a $25 AI that runs ads and outreach for me?",
    qMobile: "Why not a $25 AI that runs the marketing?",
    a: "Some tools will build a site and turn on campaigns before anyone has tested who would pay. Automating marketing before you know what deserves automation can automate waste. Make it RAIN stress-tests the buyer, names the next conversation, and learns from what happened. You approve before anything sends.",
    aMobile:
      "Running ads on a guess can automate waste. MIR stress-tests the buyer first. You approve before send.",
  },
  {
    id: "faq_daily_scanner",
    q: "Why not a daily market scanner?",
    qMobile: "Why not a daily market scanner?",
    a: "Morning signals are getting cheap. The gap is which conversation deserves your next hour, whether the problem is already paid, and what to do after the reply.",
    aMobile:
      "Signals are cheap. The job is which conversation deserves your next hour, and what to do after they reply.",
  },
  {
    id: "faq_quiz_funnel",
    q: "Is this an AI quiz funnel or lead magnet builder?",
    qMobile: "Is this a quiz funnel?",
    a: "No. Those tools personalize a report for a coach's leads. Make it RAIN runs First Customer Path on a product you already shipped: who may pay, whether the offer survives a hard buyer, and the next conversation worth your hour. You are the customer. Your buyers are not filling out our quiz.",
    aMobile:
      "No. Quiz funnels serve coaches. MIR runs who-may-pay + Stress Test on your shipped product.",
  },
  {
    id: "faq_lead_pack",
    q: "Why not buy a cheap pack of scored leads and drafted replies?",
    qMobile: "Why not a cheap pack of leads?",
    a: "A lead pack can tell you someone might reply. It does not tell you whether this buyer will pay for this offer, or what a reply should change about who you sell to and what you charge. Run First Customer Path on your URL first. Then buy leads if the offer survives.",
    aMobile:
      "Leads without a surviving offer waste the week. Stress-test first, then buy leads if you still want them.",
  },
  {
    id: "faq_free_score",
    q: "What do I get free right now?",
    qMobile: "What do I get free right now?",
    a: "Paste a product URL. See a commercial result before you create an account, then save for the full First Customer Path. No card.",
    aMobile:
      "URL in, result first. Save for First Customer Path. No card.",
  },
  {
    id: "faq_first_dollar",
    q: "Will this help me get paying customers?",
    qMobile: "Help getting paying customers?",
    a: "That is the point: lock who may pay, stress-test the offer, talk to the next person, and learn from replies. Personas alone are not enough. Guarantee: clearer ranked conversations in 60 days, or money back on fees paid. Details at /guarantee. We do not promise a sale we do not control.",
    aMobile:
      "Hard answer + next conversations + prep. Clearer talks or money back. /guarantee",
  },
  {
    id: "faq_guarantee",
    q: "What is the guarantee?",
    qMobile: "Guarantee?",
    a: "Clearer ranked conversations in 60 days, or money back on subscription fees paid in the window. The free brief has nothing to refund. After the brief, a 30-day trial (card on file) puts the guarantee in force. Companies with customers or pipeline may request RAIN Select at rainselect.com: name the constraint and the next move, or the $1,500 is returned. Full rules at /guarantee.",
    aMobile:
      "Trial: clearer conversations in 60 days, or fees back. Select: name the leak and next move, or $1,500 back. /guarantee",
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
  {
    id: "faq_deal_math",
    q: "What is the calculator on the homepage?",
    qMobile: "Homepage calculator?",
    a: "A few of your numbers, no URL: what another unpaid month is costing you in time. That is one door into the same product. First Customer Path is who may pay, Buyer Stress Test, and the next conversation. Proposal math (delivery, closer pay, what to charge) is a different calculator inside after you save an account. Neither closes the sale for you.",
    aMobile:
      "Unpaid-month cost, no URL. Then First Customer Path. Proposal math is inside after you save.",
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
    </section>
  );
}
