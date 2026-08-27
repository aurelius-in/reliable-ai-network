import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escapeHtml } from "@/lib/email";
import { RAIN_SELECT } from "@/rain-select/config";
import { sendSelectEmail } from "@/rain-select/mail";

export const dynamic = "force-dynamic";

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

  const id = str(body.id, 80);
  const email = str(body.email, 200)?.toLowerCase();
  if (!id && !email) {
    return NextResponse.json({ error: "Missing application." }, { status: 400 });
  }

  const required = [
    "first_name",
    "last_name",
    "company_name",
    "company_url",
    "role",
    "revenue_range",
    "sales_cycle",
    "suspected_constraint",
    "thirty_day_goal",
    "implementation_speed",
    "decision_authority",
  ] as const;

  for (const key of required) {
    if (!str(body[key], 2000)) {
      return NextResponse.json(
        { error: "Please complete the required fields." },
        { status: 400 }
      );
    }
  }

  const row = {
    first_name: str(body.first_name, 80),
    last_name: str(body.last_name, 80),
    company_name: str(body.company_name, 160),
    company_url: str(body.company_url, 400),
    role: str(body.role, 120),
    revenue_range: str(body.revenue_range, 40),
    monthly_revenue_range: str(body.monthly_revenue_range, 40),
    employee_range: str(body.employee_range, 40),
    sales_team_size: str(body.sales_team_size, 40),
    pipeline_range: str(body.pipeline_range, 40),
    average_deal_value_range: str(body.average_deal_value_range, 40),
    customer_count_range: str(body.customer_count_range, 40),
    sales_cycle: str(body.sales_cycle, 40),
    crm: str(body.crm, 80),
    marketing_spend_range: str(body.marketing_spend_range, 40),
    suspected_constraint: str(body.suspected_constraint, 2000),
    thirty_day_goal: str(body.thirty_day_goal, 2000),
    implementation_speed: str(body.implementation_speed, 80),
    decision_authority: str(body.decision_authority, 120),
    variant: str(body.variant, 1) || "a",
    application_status: "submitted",
    selection_status: "submitted",
    price_presented: RAIN_SELECT.monthlyPrice,
    updated_at: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    let query = admin.from("rain_select_applications").update(row);
    query = id ? query.eq("id", id) : query.ilike("email", email!);
    const { data, error } = await query
      .select("id, email, first_name, company_name, variant")
      .maybeSingle();
    if (error || !data) {
      console.error("[select-apply]", error?.message);
      return NextResponse.json({ error: "Could not submit." }, { status: 500 });
    }

    const preview = body.preview === true;
    if (!preview) {
      const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
      if (to) {
        await sendEmail({
          to,
          subject: `RAIN Select ready for review: ${data.company_name || data.email}`,
          text: `Company: ${data.company_name}\nEmail: ${data.email}\nVariant: ${data.variant}\nReview: /admin/select-applications?key=YOUR_SECRET`,
          html: `<p>RAIN Select application submitted.</p><p>Company: ${escapeHtml(String(data.company_name || ""))}<br/>Email: ${escapeHtml(String(data.email))}<br/>Variant: ${escapeHtml(String(data.variant))}</p>`,
        });
      }
      if (typeof data.email === "string") {
        const name = String(data.first_name || "").trim() || "there";
        await sendSelectEmail({
          to: data.email,
          subject: "RAIN Select application received",
          text: `${name}, we received the RAIN Select application.\n\nA person will review whether there is enough existing commercial motion, measurable upside, and 30-day leverage for the intervention to make sense. You are not selected until that review happens.\n\nIf something in the business changed, reply to this email.\n\nOliver\nRAIN Select`,
          html: `<p>${escapeHtml(name)}, we received the RAIN Select application.</p><p>A person will review whether there is enough existing commercial motion, measurable upside, and 30-day leverage for the intervention to make sense. You are not selected until that review happens.</p><p>If something in the business changed, reply to this email.</p><p>Oliver<br/>RAIN Select</p>`,
        });
      }
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("[select-apply]", err);
    return NextResponse.json({ error: "Could not submit." }, { status: 500 });
  }
}
