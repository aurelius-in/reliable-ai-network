import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { redeemAccessCode } from "@/lib/access-code-server";
import { sendEmail, escapeHtml } from "@/lib/email";
import { trackServer } from "@/lib/track-server";
import {
  INTEL_ACCESS_CODE,
  lookupIntelPerson,
} from "@/lib/intel-cohort";
import { buildIntelCodeEmail } from "@/lib/intel-email";
import { SUPPORT_EMAIL } from "@/lib/unsubscribe";

export async function POST(request: Request) {
  let body: {
    token?: string;
    landed?: string;
    stopped?: string;
    hoped?: string;
    wouldContinue?: string;
    productLine?: string;
    callOk?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const person = lookupIntelPerson(body.token);
  if (!person) {
    return NextResponse.json({ error: "Invalid survey link" }, { status: 404 });
  }

  const landed = String(body.landed ?? "").trim().slice(0, 40);
  const stopped = String(body.stopped ?? "").trim().slice(0, 40);
  const hoped = String(body.hoped ?? "").trim().slice(0, 800);
  const wouldContinue = String(body.wouldContinue ?? "").trim().slice(0, 800);
  const productLine = String(body.productLine ?? "").trim().slice(0, 240);
  const callOk = String(body.callOk ?? "").trim().slice(0, 8);

  if (!landed || !stopped || hoped.length < 8) {
    return NextResponse.json(
      { error: "Please answer the first three questions." },
      { status: 400 }
    );
  }

  await trackServer(
    "intel_survey_submit",
    {
      person: person.id,
      landed,
      stopped,
      call_ok: callOk || undefined,
    },
    { path: "/api/intel-survey" }
  );

  const adminTo = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (adminTo) {
    const text = [
      "Early founder intel survey",
      "",
      `Name: ${person.fullName}`,
      `Email: ${person.email}`,
      `Landed via: ${landed}`,
      `Stopped: ${stopped}`,
      `Hoped: ${hoped}`,
      wouldContinue ? `Would come back if: ${wouldContinue}` : "",
      productLine ? `Product: ${productLine}` : "",
      callOk ? `Call: ${callOk}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const html = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
    await sendEmail({
      to: adminTo,
      replyTo: person.email,
      subject: `Intel survey: ${person.firstName} (${stopped})`,
      text,
      html,
    }).catch(() => {});
  }

  const codeMail = buildIntelCodeEmail(person, INTEL_ACCESS_CODE);
  await sendEmail({
    to: codeMail.to,
    replyTo: codeMail.replyTo,
    subject: codeMail.subject,
    text: codeMail.text,
    html: codeMail.html,
    listUnsubscribeUrl: codeMail.listUnsubscribeUrl,
  }).catch(() => {});

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redeemed = false;
  let endsAt: string | null = null;
  if (user) {
    await ensureProfile(user);
    const admin = createAdminClient();
    const result = await redeemAccessCode(admin, user.id, INTEL_ACCESS_CODE);
    if (result.ok) {
      redeemed = true;
      endsAt = result.endsAt;
    }
  }

  return NextResponse.json({
    ok: true,
    code: INTEL_ACCESS_CODE,
    redeemed,
    endsAt,
    support: SUPPORT_EMAIL,
  });
}
