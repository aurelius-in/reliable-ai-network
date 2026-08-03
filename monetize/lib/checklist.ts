/**
 * Free Product Monetization Checkup (10 questions) + email templates.
 */

export const CHECKLIST_QUESTIONS: { q: string; why: string }[] = [
  {
    q: "What did you ship, in one sentence a stranger would understand?",
    why: "If you cannot say it simply, buyers will not either.",
  },
  {
    q: "Who has the pain you solve, and who has budget to pay for relief?",
    why: "Users and buyers are often different people.",
  },
  {
    q: "What happens if they do nothing for the next 90 days?",
    why: "Urgency comes from cost of delay, not from your feature list.",
  },
  {
    q: "What is the smallest paid offer you could sell this month?",
    why: "A clear first offer beats a vague platform story.",
  },
  {
    q: "What price would feel fair to a serious buyer and still fund your work?",
    why: "Guessing usually underprices or stalls the launch.",
  },
  {
    q: "Where do those buyers already pay attention?",
    why: "Traffic without a channel is hoping, not a plan.",
  },
  {
    q: "What is the next concrete action a visitor should take on your site?",
    why: "Attention dies without a single clear step.",
  },
  {
    q: "What objection do you hear most, and how do you answer it in one line?",
    why: "Sales conversations stall on the same 2–3 blockers.",
  },
  {
    q: "How will you know the first week was working?",
    why: "Conversations, trials, and paid interest beat vanity metrics.",
  },
  {
    q: "What is the one commercialization gap you will close next?",
    why: "Builders often jump tools instead of finishing the bottleneck.",
  },
];

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

export function checklistEmail(toName?: string): {
  subject: string;
  text: string;
  html: string;
} {
  const greeting = toName?.trim() ? `Hi ${toName.trim()},` : "Hi,";
  const questionsText = CHECKLIST_QUESTIONS.map(
    (item, i) => `${i + 1}. ${item.q}\n   Why it matters: ${item.why}`
  ).join("\n\n");

  const text = [
    greeting,
    "",
    "Here is your free Product Monetization Checkup: 10 questions every software creator should answer before (or right after) launch.",
    "",
    questionsText,
    "",
    "Most technical founders can build. The gap is usually buyers, positioning, pricing, offer, and a repeatable path to revenue.",
    "",
    `Read it online anytime: ${SITE}/checklist`,
    "",
    "When you want the guided path instead of another blank doc, start a free trial of Make it RAIN:",
    `${SITE}/pricing`,
    "",
    "You keep ownership of your product and code.",
    "",
    "Oliver",
    "Make it RAIN · Reliable AI Network × Innovative Marketing Solutions",
  ].join("\n");

  const itemsHtml = CHECKLIST_QUESTIONS.map(
    (item) => `
      <li style="margin:0 0 14px">
        <strong style="color:#0b1220">${escape(item.q)}</strong>
        <div style="color:#475569;font-size:13px;margin-top:4px">${escape(item.why)}</div>
      </li>`
  ).join("");

  const html = `
  <div style="font-family:system-ui,sans-serif;line-height:1.55;color:#0f172a;max-width:560px">
    <p style="margin:0 0 12px">${escape(greeting)}</p>
    <p style="margin:0 0 16px">Here is your free <strong>Product Monetization Checkup</strong>: 10 questions every software creator should answer before (or right after) launch.</p>
    <ol style="padding-left:18px;margin:0 0 20px">${itemsHtml}</ol>
    <p style="margin:0 0 16px;color:#334155">Most technical founders can build. The gap is usually buyers, positioning, pricing, offer, and a repeatable path to revenue.</p>
    <p style="margin:0 0 20px">
      <a href="${SITE}/checklist" style="color:#0891b2;font-weight:600">Open the checkup online</a>
    </p>
    <p style="margin:0 0 8px">When you want the guided path instead of another blank doc:</p>
    <p style="margin:0 0 20px">
      <a href="${SITE}/pricing" style="display:inline-block;background:#0891b2;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700">Start your free Make it RAIN trial</a>
    </p>
    <p style="margin:0;color:#64748b;font-size:13px">You keep ownership of your product and code.<br/>Oliver · Make it RAIN</p>
  </div>`;

  return {
    subject: "Your Product Monetization Checkup (10 questions)",
    text,
    html,
  };
}

export function checklistFollowupEmail(): {
  subject: string;
  text: string;
  html: string;
} {
  const text = [
    "Quick follow-up on the Product Monetization Checkup.",
    "",
    "If those 10 questions surfaced gaps around buyers, pricing, positioning, or launch, Make it RAIN was built for that exact moment: a guided path from a finished product to paying customers.",
    "",
    `Start the free 30-day trial (cancel anytime): ${SITE}/pricing`,
    "",
    `60-second explainer: ${SITE}/#explainer`,
    `4-minute walkthrough: https://www.youtube.com/watch?v=v8byHXuUaDY`,
    "",
    "Oliver",
    "Make it RAIN",
  ].join("\n");

  const html = `
  <div style="font-family:system-ui,sans-serif;line-height:1.55;color:#0f172a;max-width:560px">
    <p style="margin:0 0 12px">Quick follow-up on the Product Monetization Checkup.</p>
    <p style="margin:0 0 16px">If those 10 questions surfaced gaps around buyers, pricing, positioning, or launch, <strong>Make it RAIN</strong> was built for that exact moment: a guided path from a finished product to paying customers.</p>
    <p style="margin:0 0 20px">
      <a href="${SITE}/pricing" style="display:inline-block;background:#0891b2;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700">Start your free 30-day trial</a>
    </p>
    <p style="margin:0 0 8px;font-size:14px">
      <a href="${SITE}/#explainer" style="color:#0891b2">60-second explainer</a>
      ·
      <a href="https://www.youtube.com/watch?v=v8byHXuUaDY" style="color:#0891b2">4-minute walkthrough</a>
    </p>
    <p style="margin:16px 0 0;color:#64748b;font-size:13px">Oliver · Make it RAIN</p>
  </div>`;

  return {
    subject: "Ready to close the monetization gaps?",
    text,
    html,
  };
}

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
