type NotifySignupInput = {
  email: string;
  name?: string | null;
  company?: string | null;
  variant?: string | null;
  /** Homepage A/B/C cookie at signup time */
  homeAb?: string | null;
  userId?: string | null;
  totalSignups?: number;
};

/**
 * Emails the founder when someone creates an account.
 * Uses Resend HTTP API (no SDK). No-ops if RESEND_API_KEY is missing.
 */
export async function notifyFounderOfSignup(
  input: NotifySignupInput
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Make it RAIN <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[notify-signup] RESEND_API_KEY missing — skip email");
    return { sent: false, reason: "RESEND_API_KEY missing" };
  }
  if (!to) {
    console.warn("[notify-signup] ADMIN_NOTIFY_EMAIL missing — skip email");
    return { sent: false, reason: "ADMIN_NOTIFY_EMAIL missing" };
  }

  const name = input.name?.trim() || "Someone";
  const totalLine =
    typeof input.totalSignups === "number"
      ? `Total accounts now: ${input.totalSignups}`
      : "";

  const subject = `New Make it RAIN signup: ${input.email}${
    input.variant === "reviewer" ? " (reviewer)" : ""
  }`;
  const text = [
    `${name} just signed up for Make it RAIN.`,
    "",
    `Email: ${input.email}`,
    input.company ? `Company / app: ${input.company}` : "",
    input.variant ? `Variant: ${input.variant}` : "",
    input.homeAb ? `Homepage A/B: ${input.homeAb}` : "",
    input.userId ? `User id: ${input.userId}` : "",
    totalLine,
    "",
    "Counter: open /admin/counter?key=YOUR_ADMIN_STATS_SECRET",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 8px">New Make it RAIN signup</h2>
      <p style="margin:0 0 12px"><strong>${escapeHtml(name)}</strong> just created an account.</p>
      <ul style="padding-left:18px;margin:0 0 16px">
        <li>Email: ${escapeHtml(input.email)}</li>
        ${
          input.company
            ? `<li>Company / app: ${escapeHtml(input.company)}</li>`
            : ""
        }
        ${
          input.variant
            ? `<li>Variant: ${escapeHtml(input.variant)}</li>`
            : ""
        }
        ${
          input.homeAb
            ? `<li>Homepage A/B: ${escapeHtml(input.homeAb)}</li>`
            : ""
        }
        ${input.userId ? `<li>User id: ${escapeHtml(input.userId)}</li>` : ""}
        ${
          typeof input.totalSignups === "number"
            ? `<li>Total accounts now: <strong>${input.totalSignups}</strong></li>`
            : ""
        }
      </ul>
      <p style="margin:0;color:#555;font-size:13px">Check the Counter anytime at /admin/counter</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[notify-signup] Resend failed:", res.status, body);
    return { sent: false, reason: `Resend ${res.status}` };
  }

  return { sent: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
