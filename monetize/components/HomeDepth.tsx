"use client";

import type { ReactNode } from "react";
import { trackUiClick } from "@/lib/track";
import { ChecklistCapture } from "@/components/ChecklistCapture";
import { TrackedLink } from "@/components/TrackedLink";
import { CopySwap } from "@/components/CopySwap";

const PAINS = [
  {
    title: "You have users or interest… and $0",
    titleMobile: "Users or interest… and $0",
    body: "Downloads, demos, and “cool app” are not a business. You need people with budget and a reason to pay.",
    bodyMobile: "Interest isn’t revenue. You need buyers with budget.",
  },
  {
    title: "You don't know what to charge",
    titleMobile: "Don't know what to charge",
    body: "Free forever, random prices, or frozen fear. Without a defensible price and a test, money stays theoretical.",
    bodyMobile: "Free forever or guesswork. You need a defensible price and a test.",
  },
  {
    title: "You can't afford ads (and don't want a marketing degree)",
    titleMobile: "Can't afford ads",
    body: "You need a cheap way to get in front of the right people this week, not a six-month content course.",
    bodyMobile: "Need cheap attention this week, not a marketing course.",
  },
  {
    title: "You shipped software, not a path to paid",
    titleMobile: "Shipped software, not a path to paid",
    body: "No clear offer, no next step for a visitor, no script for the awkward first sales conversation.",
    bodyMobile: "No offer, next step, or first sales script.",
  },
  {
    title: "You're polishing a product that might be dead",
    titleMobile: "Polishing what might be dead",
    body: "More features feel productive. Validation, kill criteria, and a real next test are what protect your time.",
    bodyMobile: "Features feel safe. Validation and kill criteria protect your time.",
  },
];

const PROMISES = [
  {
    title: "Get to a hard commercial answer",
    titleMobile: "A hard commercial answer",
    body: "One primary buyer, one pain valuable enough to pay for, one smallest paid offer, and evidence for whether to push harder or stop — including an honest “wedge still unclear” when the first pilot buyer is not clear yet.",
    bodyMobile:
      "One buyer, valuable pain, smallest paid offer, push/stop evidence. Honest when the wedge is unclear.",
  },
  {
    title: "Who to talk to next, then name who pays",
    titleMobile: "Who to talk to next",
    body: "Rank conversations worth having this week (network warmth first; public signals when useful), draft outreach you approve, then treat buyer personas as hypotheses until conversations happen.",
    bodyMobile:
      "Next conversations + approve-before-send prep. Personas are hypotheses.",
  },
  {
    title: "Set a price you can defend and test",
    titleMobile: "A price you can defend",
    body: "Willingness-to-pay logic, packaging choices, value anchors, and a concrete pricing experiment, not a number that \"feels fair.\"",
    bodyMobile: "WTP logic, packaging, anchors, and a real pricing test.",
  },
  {
    title: "Get a clear path to paid for YOUR product",
    titleMobile: "A clear path to paid",
    body: "Smallest paid offer, funnel stages, then Post Writer, Newsletter Writer, and DM Writer — drafts personalized to your product and each recipient, plus a day-by-day plan aimed at a paid yes.",
    bodyMobile: "Offer, funnel, then personalized posts, newsletters, and DMs.",
  },
  {
    title: "Get attention without a big ad budget",
    titleMobile: "Attention without a big ad budget",
    body: "Channel picks sized to your time, Post Writer and Newsletter Writer drafts customized to your product, and a this-week sprint you can actually run.",
    bodyMobile: "Channels, personalized posts and newsletters, this-week sprint.",
  },
  {
    title: "A brief you can send, not another ChatGPT tab",
    titleMobile: "A brief you can send",
    body: "Download or share a private link with cofounders and advisors. Claims are labeled observed, founder-reported, or assumed so the memo reads like a serious commercial note. See why a path looks strong — and what would disprove it.",
    bodyMobile:
      "Shareable brief. Evidence grades. Why strong — and what would disprove it.",
  },
  {
    title: "Know whether to push harder or stop",
    titleMobile: "Push harder or stop",
    body: "A confidence-rated readout, kill criteria, and a validation plan so you don't spend months on a product nobody will buy.",
    bodyMobile: "Confidence readout, kill criteria, validation plan.",
  },
  {
    title: "One shared brief across the tools",
    titleMobile: "One brief across the tools",
    body: "The tools matter because they share your product brief, URL/GitHub evidence, and outputs — so every next step builds on the last hard answer, not another random ChatGPT tab.",
    bodyMobile: "Tools share one brief and evidence trail — not random chats.",
  },
];

function DepthPanel({
  id,
  title,
  titleMobile,
  children,
}: {
  id: string;
  title: string;
  titleMobile?: string;
  children: ReactNode;
}) {
  return (
    <details
      id={id}
      className="group scroll-mt-24 rounded-xl border border-white/10 bg-night-800/70 open:border-aqua/30"
      onToggle={(e) => {
        if (e.currentTarget.open) trackUiClick(`home_depth_${id}`);
      }}
    >
      <summary className="cursor-pointer list-none px-3.5 py-3 text-sm font-semibold text-white marker:content-none sm:px-4 sm:py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <CopySwap mobile={titleMobile ?? title} desktop={title} />
          <span className="shrink-0 text-aqua transition group-open:rotate-45">
            +
          </span>
        </span>
      </summary>
      <div className="border-t border-white/5 px-3.5 pb-3.5 pt-2.5 text-left sm:px-4 sm:pb-4 sm:pt-3">
        {children}
      </div>
    </details>
  );
}

export function HomeDepth() {
  return (
    <section className="fade-up mt-8 w-full max-w-2xl scroll-mt-24 text-left sm:mt-10">
      <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        More detail
      </p>
      <h2 className="mt-1.5 text-center text-lg font-bold text-white sm:mt-2 sm:text-2xl">
        <CopySwap
          mobile="Still deciding? Open a section."
          desktop="Still deciding? Open what matters."
          block
        />
      </h2>
      <div className="mt-4 space-y-2 sm:mt-5">
        <DepthPanel
          id="pains"
          title="If this is you: five monetization traps"
          titleMobile="Five monetization traps"
        >
          <ul className="space-y-2.5 sm:space-y-3">
            {PAINS.map((pain) => (
              <li key={pain.title}>
                <p className="font-semibold text-white">
                  <CopySwap mobile={pain.titleMobile} desktop={pain.title} />
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-300">
                  <CopySwap mobile={pain.bodyMobile} desktop={pain.body} />
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3 sm:mt-4">
            <TrackedLink
              href="/signup"
              trackTarget="pains_cta_signup"
              className="text-sm font-semibold text-aqua hover:text-aqua-bright"
            >
              Break the stall. Find who may pay →
            </TrackedLink>
          </div>
        </DepthPanel>

        <DepthPanel
          id="promises"
          title="What Make it RAIN is built to do for you"
          titleMobile="What Make it RAIN does for you"
        >
          <p className="mb-2.5 text-sm text-slate-400 sm:mb-3">
            <CopySwap
              mobile="Hard commercial answer. One brief. Shared tools."
              desktop="Get to a hard commercial answer — then use shared tools on one product brief and evidence trail, so you stop bouncing between random ChatGPT chats, Notion docs, and guesswork."
            />
          </p>
          <ul className="space-y-2.5 sm:space-y-3">
            {PROMISES.map((item) => (
              <li key={item.title}>
                <p className="font-semibold text-white">
                  <CopySwap mobile={item.titleMobile} desktop={item.title} />
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-300">
                  <CopySwap mobile={item.bodyMobile} desktop={item.body} />
                </p>
              </li>
            ))}
          </ul>
        </DepthPanel>

        <DepthPanel
          id="explainer"
          title="Prefer watching? 60-second look"
          titleMobile="60-second look"
        >
          <div className="overflow-hidden rounded-xl border border-white/10 bg-night-900">
            <div className="relative aspect-[9/16] w-full max-h-[min(50vh,380px)] bg-black sm:mx-auto sm:max-h-[min(55vh,420px)]">
              <video
                className="absolute inset-0 h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
                poster="/videos/60sec_short_ad-poster.jpg"
                title="Make it RAIN 60-second explainer"
              >
                <source src="/videos/60sec_short_ad.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <p className="mt-2.5 text-sm text-slate-400 sm:mt-3">
            <CopySwap
              mobile="Then run it on your real product."
              desktop="Then get the hard commercial answer for your real product."
            />{" "}
            <TrackedLink
              href="/signup"
              trackTarget="video_cta_signup"
              className="font-semibold text-aqua hover:text-aqua-bright"
            >
              Sign up free
            </TrackedLink>
          </p>
        </DepthPanel>

        <DepthPanel
          id="checklist"
          title="No URL yet? Optional 10 questions"
          titleMobile="Optional 10 questions"
        >
          <ChecklistCapture compact />
        </DepthPanel>

        <DepthPanel id="partners" title="Who built this">
          <h3 className="text-base font-bold text-white">
            Production builders + B2B revenue operators
          </h3>
          <div className="mt-2.5 sm:mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/partners/join_forces.gif"
              alt="Reliable AI Network and Innovative Marketing Solutions joining forces"
              className="mb-2.5 w-full object-contain sm:float-left sm:mb-3 sm:mr-5 sm:w-1/2"
            />
            <p className="text-sm leading-relaxed text-slate-300">
              <strong className="font-semibold text-white">
                Reliable AI Network
              </strong>{" "}
              ships production AI and SaaS systems.{" "}
              <strong className="font-semibold text-white">
                Innovative Marketing Solutions
              </strong>{" "}
              runs B2B revenue, RevOps, and lead-to-cash motions for growth
              teams. Make it RAIN packages that combined judgment so builders
              who already shipped can get a commercial path without a $10k
              agency engagement.
            </p>
            <p className="mt-2.5 text-sm font-medium text-slate-200 sm:mt-3">
              Unique mechanism: Buyer Stress Test. Does this offer survive a
              hard buyer before you spend another week promoting it.
            </p>
          </div>
          <p className="mt-2.5 clear-both flex flex-wrap gap-x-4 gap-y-2 text-sm sm:mt-3">
            <a
              href="https://reliableainetwork.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-aqua transition hover:text-aqua-bright"
            >
              Reliable AI Network
            </a>
            <a
              href="https://innovativemarketingb2b.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-aqua transition hover:text-aqua-bright"
            >
              Innovative Marketing Solutions
            </a>
          </p>
        </DepthPanel>
      </div>
    </section>
  );
}
