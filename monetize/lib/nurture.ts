/**
 * 5-email nurture after Product Monetization Checkup signup.
 * Email 1 sends immediately; 2–5 are scheduled via Resend.
 */

import { CHECKLIST_QUESTIONS } from "@/lib/checklist";
import {
  COMPANY_MAILING_ADDRESS,
  unsubscribeUrl,
} from "@/lib/unsubscribe";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

const WALKTHROUGH = "https://www.youtube.com/watch?v=v8byHXuUaDY";

export type NurtureEmail = {
  key: string;
  /** Hours after signup */
  delayHours: number;
  subject: string;
  text: string;
  html: string;
};

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
      <a href="${SITE}/pricing" style="color:#374151">Begin 30-day trial</a>
      · <a href="https://rainselect.com/?utm_source=makeitrain&utm_medium=email&utm_campaign=nurture" style="color:#374151">RAIN Select</a>
      · <a href="${SITE}/checklist" style="color:#374151">Open checkup</a>
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

export function buildNurtureSequence(opts: {
  toName?: string;
  toEmail: string;
}): NurtureEmail[] {
  const greeting = opts.toName?.trim()
    ? `Hi ${opts.toName.trim()},`
    : "Hi,";
  const unsubHref = unsubscribeUrl(opts.toEmail, SITE);
  const unsubFooter = footerText(unsubHref);

  const questionsText = CHECKLIST_QUESTIONS.map(
    (item, i) => `${i + 1}. ${item.q}\n   Why it matters: ${item.why}`
  ).join("\n\n");

  const itemsHtml = CHECKLIST_QUESTIONS.map(
    (item) => `
      <li style="margin:0 0 14px">
        <strong style="color:#0b1220">${escape(item.q)}</strong>
        <div style="color:#475569;font-size:13px;margin-top:4px">${escape(item.why)}</div>
      </li>`
  ).join("");

  return [
    {
      key: "nurture_1_checkup",
      delayHours: 0,
      subject: "Your Product Monetization Checkup (10 questions)",
      text: [
        greeting,
        "",
        "Here is your free Product Monetization Checkup: 10 questions every software creator should answer before (or right after) launch.",
        "",
        questionsText,
        "",
        "Most technical founders can build. The gap is usually buyers, positioning, pricing, offer, and a repeatable path to revenue.",
        "",
        "Make it RAIN is not an app builder. You keep your product and code. We help commercialize what you already own.",
        "",
        `Read it online: ${SITE}/checklist`,
        `Start a free trial when ready: ${SITE}/pricing`,
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">Here is your free <strong>Product Monetization Checkup</strong>: 10 questions every software creator should answer before (or right after) launch.</p>
        <ol style="padding-left:18px;margin:0 0 20px">${itemsHtml}</ol>
        <p style="margin:0 0 16px;color:#334155">Most technical founders can build. The gap is usually buyers, positioning, pricing, offer, and a repeatable path to revenue.</p>
        <p style="margin:0 0 16px;color:#334155">Make it RAIN is not an app builder. You keep your product and code. We help commercialize what you already own.</p>
        <p style="margin:0 0 12px"><a href="${SITE}/checklist" style="color:#0891b2;font-weight:600">Open the checkup online</a></p>
        ${cta("Start your free Make it RAIN trial", `${SITE}/pricing`)}
      `,
        unsubHref
      ),
    },
    {
      key: "nurture_2_gaps",
      delayHours: 24,
      subject: "The 3 monetization gaps that stall shipped products",
      text: [
        greeting,
        "",
        "After the checkup, most builders get stuck in the same three places:",
        "",
        "1. Buyer clarity — shipping for 'everyone' means selling to no one.",
        "2. Offer and price — a great product with a fuzzy offer rarely converts.",
        "3. Path to revenue — posts and hope are not a launch system.",
        "",
        "Make it RAIN is built to close those gaps in order, not dump 15 blank tools on you.",
        "",
        `See how it works: ${SITE}/#explainer`,
        `Walkthrough: ${WALKTHROUGH}`,
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">After the checkup, most builders get stuck in the same three places:</p>
        <ol style="padding-left:18px;margin:0 0 16px">
          <li style="margin:0 0 10px"><strong>Buyer clarity</strong> — shipping for “everyone” means selling to no one.</li>
          <li style="margin:0 0 10px"><strong>Offer and price</strong> — a great product with a fuzzy offer rarely converts.</li>
          <li style="margin:0 0 10px"><strong>Path to revenue</strong> — posts and hope are not a launch system.</li>
        </ol>
        <p style="margin:0 0 16px">Make it RAIN is built to close those gaps in order, not dump fifteen blank tools on you.</p>
        <p style="margin:0 0 12px;font-size:14px">
          <a href="${SITE}/#explainer" style="color:#0891b2">60-second explainer</a> ·
          <a href="${WALKTHROUGH}" style="color:#0891b2">4-minute walkthrough</a>
        </p>
        ${cta("See plans & start free trial", `${SITE}/pricing`)}
      `,
        unsubHref
      ),
    },
    {
      key: "nurture_3_path",
      delayHours: 72,
      subject: "What Make it RAIN actually does in the first session",
      text: [
        greeting,
        "",
        "Here is the first-session path:",
        "",
        "1. Tell it what you built.",
        "2. Clarify buyer, offer, pricing, and path.",
        "3. Generate an actionable launch and sales plan.",
        "4. Track results and improve.",
        "",
        "You keep ownership of your product and code. The app guides the commercialization side.",
        "",
        `Start free trial: ${SITE}/pricing`,
        `Walkthrough: ${WALKTHROUGH}`,
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 12px">Here is the first-session path:</p>
        <ol style="padding-left:18px;margin:0 0 16px">
          <li style="margin:0 0 8px">Tell it what you built.</li>
          <li style="margin:0 0 8px">Clarify buyer, offer, pricing, and path.</li>
          <li style="margin:0 0 8px">Generate an actionable launch and sales plan.</li>
          <li style="margin:0 0 8px">Track results and improve.</li>
        </ol>
        <p style="margin:0 0 16px">You keep ownership of your product and code. The app guides the commercialization side.</p>
        <p style="margin:0 0 12px;font-size:14px">
          <a href="${WALKTHROUGH}" style="color:#0891b2">Watch the 4-minute walkthrough</a>
        </p>
        ${cta("Start free trial", `${SITE}/pricing`)}
      `,
        unsubHref
      ),
    },
    {
      key: "nurture_4_trial",
      delayHours: 120,
      subject: "Try Make it RAIN on the product you already shipped",
      text: [
        greeting,
        "",
        "If the checkup showed gaps, the fastest way to test the product is to run it on your real app:",
        "",
        "- 30-day free trial on the plan you choose",
        "- Cancel anytime",
        "- Built by Reliable AI Network with Innovative Marketing Solutions",
        "",
        `${SITE}/pricing`,
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">If the checkup showed gaps, the fastest way to test the product is to run it on your <strong>real</strong> app.</p>
        <ul style="padding-left:18px;margin:0 0 16px">
          <li>30-day free trial on the plan you choose</li>
          <li>Cancel anytime</li>
          <li>Built by Reliable AI Network with Innovative Marketing Solutions</li>
        </ul>
        ${cta("Start your free trial", `${SITE}/pricing`)}
      `,
        unsubHref
      ),
    },
    {
      key: "nurture_5_last",
      delayHours: 168,
      subject: "Last note: close the gap between shipped and sold",
      text: [
        greeting,
        "",
        "Last note from me on the checkup sequence.",
        "",
        "Shipping was the hard technical part. Monetization is the next system: buyers, pricing, offer, launch, sales, and what to fix.",
        "",
        "If you want that guided instead of another blank doc:",
        `${SITE}/pricing`,
        "",
        "If now is not the time, keep the checkup and come back when you are ready.",
        "",
        unsubFooter,
      ].join("\n"),
      html: wrapHtml(
        `
        <p style="margin:0 0 12px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">Last note from me on the checkup sequence.</p>
        <p style="margin:0 0 16px">Shipping was the hard technical part. Monetization is the next system: buyers, pricing, offer, launch, sales, and what to fix.</p>
        <p style="margin:0 0 16px">If you want that guided instead of another blank doc:</p>
        ${cta("Start free trial", `${SITE}/pricing`)}
        <p style="margin:0;color:#475569;font-size:14px">If now is not the time, keep the checkup and come back when you are ready.</p>
      `,
        unsubHref
      ),
    },
  ];
}

/** Illustrative journeys for the homepage — NOT customer testimonials. */
export const ILLUSTRATIVE_JOURNEYS = [
  {
    title: "Solo AI tool founder",
    situation: "Shipped a working AI utility, strong demos, almost no paid users.",
    focus: "Buyer clarity → pricing → 7-day launch actions",
    resultShape:
      "Leaves session 1 with a specific ICP, a defensible price band, and outreach targets.",
  },
  {
    title: "Indie SaaS builder",
    situation: "Product live for months; traffic exists; conversion is unclear.",
    focus: "Offer path → funnel → what’s leaking",
    resultShape:
      "Gets a practical visitor-to-customer path and a short list of fixes to test next.",
  },
  {
    title: "Technical cofounder",
    situation: "Built the product; partner expected ‘marketing’ to appear magically.",
    focus: "Positioning → sales conversations → next best action",
    resultShape:
      "Walks away with message angles and a prioritized commercialization checklist.",
  },
] as const;
