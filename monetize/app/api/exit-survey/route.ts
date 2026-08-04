import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { normalizeHomeVariant } from "@/lib/home-ab";
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
    /** Page surface: invite | signup | sample | … */
    source?: string;
    /** Legacy alias for source (pre home_ab). */
    variant?: string;
    /** Homepage A/B/C cookie. */
    home_ab?: string;
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
  const source = (body?.source ?? body?.variant ?? "").trim().slice(0, 32);
  const homeAb = normalizeHomeVariant(body?.home_ab);

  // Await: `void`-ed promises can be dropped when the serverless function
  // freezes after responding — survey submits would silently disappear.
  await trackServer(
    "exit_survey",
    {
      reason,
      path,
      source: source || undefined,
      ...(homeAb ? { home_ab: homeAb } : {}),
      // Keep legacy key so older counter queries still see a page tag.
      ...(source ? { variant: source } : {}),
    },
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
      source ? `Source: ${source}` : "",
      homeAb ? `Homepage A/B: ${homeAb.toUpperCase()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    await sendEmail({
      to,
      subject: `Exit survey: ${reason}${homeAb ? ` [${homeAb.toUpperCase()}]` : ""}`,
      text,
      html: `<pre style="font-family:system-ui,sans-serif">${text}</pre>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
