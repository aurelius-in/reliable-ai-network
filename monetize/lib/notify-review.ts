import { escapeHtml, sendEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/stripe";
import { formatReviewByline, REVIEW_NOTIFY_TO } from "@/lib/reviews";

export async function notifyFoundersOfReview(input: {
  id: string;
  authorName: string;
  companyName: string;
  body: string;
}): Promise<void> {
  const appUrl = getAppUrl().replace(/\/$/, "");
  const secret = process.env.ADMIN_STATS_SECRET?.trim();
  const adminUrl = secret
    ? `${appUrl}/admin/reviews?key=${encodeURIComponent(secret)}`
    : `${appUrl}/admin/reviews`;

  const byline = formatReviewByline(input.authorName, input.companyName);
  const subject = `New Make it RAIN review from ${byline}`;
  const preview = input.body.slice(0, 280);
  const text = [
    "Someone left a product review.",
    "",
    `Name: ${input.authorName}`,
    `Company / app: ${input.companyName}`,
    `Review id: ${input.id}`,
    "",
    preview,
    input.body.length > 280 ? "..." : "",
    "",
    `Approve / edit: ${adminUrl}`,
    `Public page: ${appUrl}/reviews`,
  ].join("\n");

  const html = `
    <p><strong>Someone left a product review.</strong></p>
    <p><strong>Name:</strong> ${escapeHtml(input.authorName)}<br/>
    <strong>Company / app:</strong> ${escapeHtml(input.companyName)}<br/>
    <strong>Id:</strong> ${escapeHtml(input.id)}</p>
    <blockquote style="border-left:3px solid #00a8c4;padding-left:12px;color:#334;">
      ${escapeHtml(preview)}${input.body.length > 280 ? "..." : ""}
    </blockquote>
    <p><a href="${escapeHtml(adminUrl)}">Approve / edit reviews</a></p>
    <p><a href="${escapeHtml(appUrl)}/reviews">Open Reviews page</a></p>
  `;

  await sendEmail({
    to: [...REVIEW_NOTIFY_TO],
    subject,
    text,
    html,
  });
}
