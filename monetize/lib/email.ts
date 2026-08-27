/**
 * Thin Resend HTTP helper (no SDK). Shared by founder alerts and lead emails.
 */

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  /** Override From. Select mail should not use the Make it RAIN sender. */
  from?: string;
  /** ISO timestamp for delayed send (Resend scheduled_at) */
  scheduledAt?: string;
  /** One-click / list unsubscribe URL (marketing mail) */
  listUnsubscribeUrl?: string;
  replyTo?: string;
};

export async function sendEmail(
  input: SendEmailInput
): Promise<{ sent: boolean; reason?: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    input.from?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Make it RAIN <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY missing — skip send");
    return { sent: false, reason: "RESEND_API_KEY missing" };
  }

  const to = Array.isArray(input.to) ? input.to : [input.to];
  const body: Record<string, unknown> = {
    from,
    to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  };
  if (input.scheduledAt) {
    body.scheduled_at = input.scheduledAt;
  }
  if (input.replyTo) {
    body.reply_to = input.replyTo;
  }
  if (input.listUnsubscribeUrl) {
    body.headers = {
      "List-Unsubscribe": `<${input.listUnsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[email] Resend failed:", res.status, errBody);
    return { sent: false, reason: `Resend ${res.status}` };
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { sent: true, id: data.id };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
