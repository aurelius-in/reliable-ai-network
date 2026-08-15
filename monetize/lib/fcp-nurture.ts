/**
 * 7-email nurture after First Customer Path / Founder Brief.
 * Spec: marketing/26-08-14_nurture.md
 * Not wired yet. Call when a brief completes.
 */

import type { NurtureEmail } from "@/lib/nurture";
import {
  COMPANY_MAILING_ADDRESS,
  unsubscribeUrl,
} from "@/lib/unsubscribe";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

const EXAMPLES = `${SITE}/#examples`;

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapHtml(body: string, unsubHref: string): string {
  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.55;color:#0f172a;max-width:560px">
    ${body}
    <p style="margin:24px 0 0;color:#64748b;font-size:13px">
      Oliver · Make it RAIN<br/>
      Reliable AI Network, LLC × Innovative Marketing Solutions<br/>
      ${escape(COMPANY_MAILING_ADDRESS)}<br/>
      <a href="${SITE}/pricing" style="color:#0891b2">See plans</a>
      · <a href="${EXAMPLES}" style="color:#0891b2">Real briefs</a>
      · <a href="${unsubHref}" style="color:#0891b2">Unsubscribe</a>
    </p>
  </div>`;
}

function footerText(unsubHref: string): string {
  return [
    "Oliver · Make it RAIN",
    "Reliable AI Network, LLC × Innovative Marketing Solutions",
    COMPANY_MAILING_ADDRESS,
    `Unsubscribe: ${unsubHref}`,
  ].join("\n");
}

function cta(label: string, href: string): string {
  return `<p style="margin:0 0 20px">
    <a href="${href}" style="display:inline-block;background:#0891b2;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700">${escape(label)}</a>
  </p>`;
}

export function buildFirstCustomerPathNurture(opts: {
  toName?: string;
  toEmail: string;
  briefUrl?: string;
  finding?: string;
  recommendedTier?: "starter" | "growth" | "pro";
}): NurtureEmail[] {
  const greeting = opts.toName?.trim()
    ? `Hi ${opts.toName.trim()},`
    : "Hi,";
  const unsubHref = unsubscribeUrl(opts.toEmail, SITE);
  const unsubFooter = footerText(unsubHref);
  const brief = opts.briefUrl || `${SITE}/dashboard`;
  const finding =
    opts.finding?.trim() ||
    "Open the brief and read the Buyer Stress Test first. That is the finding that should change this week.";
  const tier =
    opts.recommendedTier === "growth"
      ? "Growth: reach them and run the work."
      : opts.recommendedTier === "pro"
        ? "Pro: learn what closes and keep improving the next move."
        : "Starter: find who may pay and get the offer ready.";

  return [
    {
      key: "fcp_1_finding",
      delayHours: 0,
      subject: "The most important finding in your First Customer Path",
      text: [
        greeting,
        "",
        finding,
        "",
        `Your brief: ${brief}`,
        "",
        "Do one conversation in the next 24 hours. Not a content calendar.",
        "Reply with who you are going to talk to.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">${escape(finding)}</p>
        ${cta("Open your brief", brief)}
        <p style="margin:0 0 16px">Do one conversation in the next 24 hours. Not a content calendar.</p>
        <p style="margin:0 0 16px">Reply with who you are going to talk to.</p>
      `,
        unsubHref
      ),
    },
    {
      key: "fcp_2_unpaid",
      delayHours: 24,
      subject: "Four ways to stay at $0 after you ship",
      text: [
        greeting,
        "",
        "Build more. Post into the void. Buy a pack of leads. Let an AI run ads on a guess.",
        "Another unpaid month is the cost. Your brief already named a cheaper test.",
        "",
        "Reply: which of the four were you about to do this week.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">Build more. Post into the void. Buy a pack of leads. Let an AI run ads on a guess.</p>
        <p style="margin:0 0 16px">Another unpaid month is the cost. Your brief already named a cheaper test.</p>
        <p style="margin:0 0 16px">Reply: which of the four were you about to do this week.</p>
        ${cta("Open your brief", brief)}
      `,
        unsubHref
      ),
    },
    {
      key: "fcp_3_stress",
      delayHours: 48,
      subject: "Would this offer survive a hard buyer?",
      text: [
        greeting,
        "",
        "Find who may pay is the desire. Buyer Stress Test is the mechanism.",
        "Read the hostile-buyer section in your brief before you spend another week promoting the current offer.",
        "",
        "Reply: what would a skeptical buyer say to your homepage.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">Find who may pay is the desire. Buyer Stress Test is the mechanism.</p>
        <p style="margin:0 0 16px">Read the hostile-buyer section in your brief before you spend another week promoting the current offer.</p>
        <p style="margin:0 0 16px">Reply: what would a skeptical buyer say to your homepage.</p>
        ${cta("Open the Stress Test", brief)}
      `,
        unsubHref
      ),
    },
    {
      key: "fcp_4_example",
      delayHours: 72,
      subject: "Original offer to rewritten offer (names covered)",
      text: [
        greeting,
        "",
        "Here is the same job on someone else's live URL, names covered.",
        EXAMPLES,
        "",
        "A plan is easy to get free. The proof is an offer getting attacked, then rewritten.",
        "Want the same attack pointed at yours? Reply yes.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">Here is the same job on someone else's live URL, names covered.</p>
        ${cta("See a real brief", EXAMPLES)}
        <p style="margin:0 0 16px">A plan is easy to get free. The proof is an offer getting attacked, then rewritten.</p>
        <p style="margin:0">Want the same attack pointed at yours? Reply yes.</p>
      `,
        unsubHref
      ),
    },
    {
      key: "fcp_5_chatgpt",
      delayHours: 96,
      subject: "Plans are free. Surviving buyers is not.",
      text: [
        greeting,
        "",
        "ChatGPT will write a GTM plan. A scanner will dump morning signals. A cheap pack will score leads.",
        "None of that answers whether this buyer will pay for this offer.",
        "",
        "Reply: did a free plan already tell you who pays, or just how to do GTM.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">ChatGPT will write a GTM plan. A scanner will dump morning signals. A cheap pack will score leads.</p>
        <p style="margin:0 0 16px">None of that answers whether this buyer will pay for this offer.</p>
        <p style="margin:0 0 16px">Reply: did a free plan already tell you who pays, or just how to do GTM.</p>
        ${cta("Open your brief", brief)}
      `,
        unsubHref
      ),
    },
    {
      key: "fcp_6_workaround",
      delayHours: 120,
      subject: "What are you already paying (or burning hours on) to solve this?",
      text: [
        greeting,
        "",
        "Ads, a contractor, a lead pack, Reddit time, another feature. Pain with a budget is more useful than abstract pain.",
        "Reply with the workaround. One line.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">Ads, a contractor, a lead pack, Reddit time, another feature. Pain with a budget is more useful than abstract pain.</p>
        <p style="margin:0">Reply with the workaround. One line.</p>
      `,
        unsubHref
      ),
    },
    {
      key: "fcp_7_tier",
      delayHours: 144,
      subject: "What to do next with what we found",
      text: [
        greeting,
        "",
        `If you want the paid path that matches the brief: ${tier}`,
        "",
        "Starter = get the offer ready. Growth = reach them. Pro = learn what closes.",
        "No fake countdown. Free path has no card. Paid: clearer ranked conversations in 60 days, or money back on fees paid.",
        "",
        "Reply starter, growth, or not yet, and why.",
        "",
        `${SITE}/pricing`,
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">If you want the paid path that matches the brief: <strong>${escape(tier)}</strong></p>
        <p style="margin:0 0 16px">Starter = get the offer ready. Growth = reach them. Pro = learn what closes.</p>
        <p style="margin:0 0 16px">No fake countdown. Free path has no card. Paid: clearer ranked conversations in 60 days, or money back on fees paid.</p>
        <p style="margin:0 0 16px">Reply starter, growth, or not yet, and why.</p>
        ${cta("See plans", `${SITE}/pricing`)}
      `,
        unsubHref
      ),
    },
  ];
}
