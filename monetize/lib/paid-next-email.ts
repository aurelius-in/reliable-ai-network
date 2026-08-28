import { sendEmail, escapeHtml } from "@/lib/email";
import { PAID_NEXT } from "@/lib/paid-next";
import {
  COMPANY_MAILING_ADDRESS,
  unsubscribeUrl,
} from "@/lib/unsubscribe";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

export async function sendPaidNextEmail(opts: {
  to: string;
  firstName?: string | null;
}): Promise<void> {
  const name = opts.firstName?.trim() || "there";
  const trialHref = `${SITE}${PAID_NEXT.mirCheckout}`;
  const plansHref = `${SITE}${PAID_NEXT.mirPlans}`;
  const guaranteeHref = `${SITE}${PAID_NEXT.mirGuarantee}`;
  const selectHref = PAID_NEXT.selectHref;
  const unsubHref = unsubscribeUrl(opts.to, SITE);

  const subject = `${name}, your First Customer Path is ready. Two ways to continue.`;

  const text = [
    `Hi ${name},`,
    "",
    "The First Customer Path is complete. Here is how the work continues.",
    "",
    "Make it RAIN trial",
    "Card on file. Cancel before day 30 and nothing is billed.",
    `${PAID_NEXT.mirProof}. ${guaranteeHref}`,
    trialHref,
    `Plans: ${plansHref}`,
    "",
    "RAIN Select",
    `A $${PAID_NEXT.selectPrice.toLocaleString("en-US")} 30-Day Revenue Intervention for companies with customers or pipeline. We review fit first. ${PAID_NEXT.selectProof}`,
    selectHref,
    "",
    "Oliver",
    "Make it RAIN",
    COMPANY_MAILING_ADDRESS,
    `Unsubscribe: ${unsubHref}`,
  ].join("\n");

  const html = `
  <div style="font-family:Georgia,'Times New Roman',serif;line-height:1.6;color:#111827;max-width:540px">
    <p style="margin:0 0 20px">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 28px">The First Customer Path is complete. Here is how the work continues.</p>
    <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280">Make it RAIN</p>
    <p style="margin:0 0 12px"><strong>30-day trial.</strong> Card on file. Cancel before day 30 and nothing is billed. ${escapeHtml(PAID_NEXT.mirProof)}.</p>
    <p style="margin:0 0 8px;font-family:system-ui,sans-serif">
      <a href="${escapeHtml(trialHref)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:11px 18px;font-size:14px;font-weight:600">${escapeHtml(PAID_NEXT.mirCta)}</a>
    </p>
    <p style="margin:0 0 32px;font-family:system-ui,sans-serif;font-size:13px;color:#6b7280">
      <a href="${escapeHtml(plansHref)}" style="color:#374151">Compare plans</a>
      &nbsp;·&nbsp;
      <a href="${escapeHtml(guaranteeHref)}" style="color:#374151">Guarantee terms</a>
    </p>
    <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280">RAIN Select</p>
    <p style="margin:0 0 12px">${escapeHtml(PAID_NEXT.selectBody)}</p>
    <p style="margin:0 0 28px;font-family:system-ui,sans-serif">
      <a href="${escapeHtml(selectHref)}" style="display:inline-block;border:1px solid #111827;color:#111827;text-decoration:none;padding:10px 18px;font-size:14px;font-weight:600">${escapeHtml(PAID_NEXT.selectCta)}</a>
    </p>
    <p style="margin:0;font-family:system-ui,sans-serif;color:#9ca3af;font-size:12px;line-height:1.6">
      Oliver · Make it RAIN<br/>
      ${escapeHtml(COMPANY_MAILING_ADDRESS)}<br/>
      <a href="${escapeHtml(unsubHref)}" style="color:#6b7280">Unsubscribe</a>
    </p>
  </div>`;

  await sendEmail({
    to: opts.to,
    subject,
    text,
    html,
    listUnsubscribeUrl: unsubHref,
  });
}
