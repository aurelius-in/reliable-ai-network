import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escapeHtml } from "@/lib/email";
import { RAIN_SELECT } from "@/rain-select/config";

export const dynamic = "force-dynamic";

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return null;
  return email;
}

function str(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().slice(0, max);
  return t || null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid business email." }, { status: 400 });
  }

  const variant = str(body.variant, 1) || "a";
  const preview = body.preview === true;

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("rain_select_applications")
      .select("id, selection_status")
      .ilike("email", email)
      .maybeSingle();

    const patch = {
      email,
      variant,
      preview,
      anonymous_visitor_id: str(body.anonymous_visitor_id, 80),
      first_touch_source: str(body.first_touch_source, 120),
      first_touch_medium: str(body.first_touch_medium, 120),
      first_touch_campaign: str(body.first_touch_campaign, 120),
      first_touch_content: str(body.first_touch_content, 120),
      first_touch_term: str(body.first_touch_term, 120),
      first_referrer: str(body.first_referrer, 400),
      last_touch_source: str(body.last_touch_source, 120),
      last_touch_medium: str(body.last_touch_medium, 120),
      last_touch_campaign: str(body.last_touch_campaign, 120),
      landing_url: str(body.landing_url, 400),
      price_presented: RAIN_SELECT.monthlyPrice,
      updated_at: new Date().toISOString(),
    };

    let id: string;
    if (existing?.id) {
      id = existing.id as string;
      if (existing.selection_status === "email_only") {
        await admin.from("rain_select_applications").update(patch).eq("id", id);
      }
    } else {
      const { data, error } = await admin
        .from("rain_select_applications")
        .insert({
          ...patch,
          application_status: "email_only",
          selection_status: "email_only",
        })
        .select("id")
        .single();
      if (error || !data) {
        console.error("[select-email]", error?.message);
        return NextResponse.json(
          { error: "Could not start the application." },
          { status: 500 }
        );
      }
      id = data.id as string;
    }

    if (!preview) {
      const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
      if (to) {
        await sendEmail({
          to,
          subject: `RAIN Select application started: ${email} (${variant})`,
          text: `Email: ${email}\nVariant: ${variant}\nId: ${id}`,
          html: `<p>RAIN Select application started.</p><p>Email: ${escapeHtml(email)}<br/>Variant: ${escapeHtml(variant)}<br/>Id: ${escapeHtml(id)}</p>`,
        });
      }
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[select-email]", err);
    return NextResponse.json(
      { error: "Could not start the application." },
      { status: 500 }
    );
  }
}
