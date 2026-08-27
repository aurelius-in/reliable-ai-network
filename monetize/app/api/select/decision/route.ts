import { NextResponse } from "next/server";
import { adminKeyFromRequest, assertAdminSecret } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml } from "@/lib/email";
import { RAIN_SELECT } from "@/rain-select/config";
import { sendSelectEmail } from "@/rain-select/mail";

export const dynamic = "force-dynamic";

const STATUSES = [
  "selected",
  "not_selected_yet",
  "better_fit_other_path",
  "qualified_capacity_full",
] as const;

export async function POST(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" ? body.status : "";
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: "Bad decision" }, { status: 400 });
  }

  const reason =
    typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : "";
  const offerMir = body.offer_mir === true;
  const nextStep =
    typeof body.next_step_url === "string"
      ? body.next_step_url.trim().slice(0, 400)
      : "";

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rain_select_applications")
      .update({
        selection_status: status,
        application_status: status,
        selection_reason: status === "selected" ? reason || null : null,
        decline_reason: status !== "selected" ? reason || null : null,
        next_step_url: nextStep || null,
        mir_referral_offered_at: offerMir ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("email, first_name, company_name")
      .single();

    if (error || !data?.email) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const name = data.first_name || "there";
    const company = data.company_name || "the business";

    if (status === "selected") {
      await sendSelectEmail({
        to: data.email,
        subject: "You've been selected for RAIN Select",
        text: `${name}, we see enough commercial motion in ${company} to justify a 30-Day Revenue Intervention.${reason ? `\n\n${reason}` : ""}\n\n30-Day Revenue Intervention: $${RAIN_SELECT.monthlyPrice.toLocaleString("en-US")}.${nextStep ? `\n\nBegin here: ${nextStep}` : ""}\n\nReply to this email if you want to proceed.\n\nOliver\nRAIN Select`,
        html: `<p>${escapeHtml(String(name))}, we see enough commercial motion in ${escapeHtml(String(company))} to justify a 30-Day Revenue Intervention.</p>${reason ? `<p>${escapeHtml(reason)}</p>` : ""}<p>30-Day Revenue Intervention: $${RAIN_SELECT.monthlyPrice.toLocaleString("en-US")}.</p>${nextStep ? `<p><a href="${escapeHtml(nextStep)}">Begin the 30-Day Intervention</a></p>` : ""}<p>Reply to this email if you want to proceed.</p><p>Oliver<br/>RAIN Select</p>`,
      });
    } else {
      let extra = "";
      if (offerMir || status === "better_fit_other_path") {
        extra = `\n\nRAIN Select is probably too early for this business. If the immediate job is still figuring out who may pay, what offer to test, and which buyer conversation is worth having, there is a lower-cost self-guided RAIN product built for that stage: ${RAIN_SELECT.mirReferralUrl}`;
      }
      await sendSelectEmail({
        to: data.email,
        subject: "RAIN Select application update",
        text: `${name}, we do not think a $${RAIN_SELECT.monthlyPrice.toLocaleString("en-US")} RAIN Select engagement is the right commercial move for ${company} right now.${reason ? `\n\n${reason}` : ""}${extra}\n\nOliver\nRAIN Select`,
        html: `<p>${escapeHtml(String(name))}, we do not think a $${RAIN_SELECT.monthlyPrice.toLocaleString("en-US")} RAIN Select engagement is the right commercial move for ${escapeHtml(String(company))} right now.</p>${reason ? `<p>${escapeHtml(reason)}</p>` : ""}${extra ? `<p>RAIN Select is probably too early for this business. If the immediate job is still figuring out who may pay, there is a <a href="${RAIN_SELECT.mirReferralUrl}">lower-cost self-guided path</a>.</p>` : ""}<p>Oliver<br/>RAIN Select</p>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[select-decision]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
