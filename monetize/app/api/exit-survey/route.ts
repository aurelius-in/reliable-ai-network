import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { trackServer } from "@/lib/track-server";

const REASONS = new Set([
  "unclear_outcome",
  "unsure_why_signup",
  "distrust_link",
  "no_product_info",
  "wanted_sample",
  "not_ready_time",
  "other",
]);

export async function POST(request: Request) {
  let body: {
    reason?: string;
    detail?: string;
    path?: string;
    variant?: string;
  } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const reason = (body?.reason ?? "").trim();
  if (!REASONS.has(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const detail = (body?.detail ?? "").trim().slice(0, 500);
  const path = (body?.path ?? "").trim().slice(0, 200);
  const variant = (body?.variant ?? "").trim().slice(0, 32);

  void trackServer(
    "exit_survey",
    { reason, path, variant },
    { path: "/api/exit-survey" }
  );

  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (to) {
    const text = [
      "Exit / trust survey response",
      "",
      `Reason: ${reason}`,
      detail ? `Detail: ${detail}` : "",
      path ? `Path: ${path}` : "",
      variant ? `Variant: ${variant}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    void sendEmail({
      to,
      subject: `Exit survey: ${reason}`,
      text,
      html: `<pre style="font-family:system-ui,sans-serif">${text}</pre>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
