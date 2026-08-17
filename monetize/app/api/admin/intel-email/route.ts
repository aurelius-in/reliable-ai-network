import { NextResponse } from "next/server";
import { assertAdminSecret, adminKeyFromRequest } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";
import { INTEL_COHORT } from "@/lib/intel-cohort";
import { buildIntelOutreachEmail } from "@/lib/intel-email";

/**
 * Founder-only: send the early-intel outreach emails.
 * POST { personId?: "clive"|"praful"|"james"|"vinicius", dryRun?: boolean }
 */
export async function POST(request: Request) {
  const gate = assertAdminSecret(adminKeyFromRequest(request));
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: { personId?: string; dryRun?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const people = body.personId
    ? [lookupIntelPersonById(body.personId)].filter(
        (p): p is NonNullable<typeof p> => Boolean(p)
      )
    : INTEL_COHORT;

  if (body.personId && people.length === 0) {
    return NextResponse.json({ error: "Unknown personId" }, { status: 404 });
  }

  const results: {
    id: string;
    email: string;
    subject: string;
    sent: boolean;
    reason?: string;
    idResend?: string;
  }[] = [];

  for (const person of people) {
    const built = buildIntelOutreachEmail(person);
    if (body.dryRun) {
      results.push({
        id: person.id,
        email: person.email,
        subject: built.subject,
        sent: false,
        reason: "dry_run",
      });
      continue;
    }
    const out = await sendEmail({
      to: built.to,
      replyTo: built.replyTo,
      subject: built.subject,
      text: built.text,
      html: built.html,
      listUnsubscribeUrl: built.listUnsubscribeUrl,
    });
    results.push({
      id: person.id,
      email: person.email,
      subject: built.subject,
      sent: out.sent,
      reason: out.reason,
      idResend: out.id,
    });
  }

  return NextResponse.json({ ok: true, dryRun: Boolean(body.dryRun), results });
}

function lookupIntelPersonById(id: string) {
  const key = id.trim().toLowerCase();
  return INTEL_COHORT.find((p) => p.id === key) ?? null;
}
