import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyUnsubscribeToken,
} from "@/lib/unsubscribe";

type NurtureMeta = { key?: string; id?: string; at?: string; ok?: boolean };

async function cancelResendEmail(id: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !id) return;
  try {
    await fetch(`https://api.resend.com/emails/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (err) {
    console.warn("[unsubscribe] cancel resend failed:", id, err);
  }
}

export async function POST(request: Request) {
  let email = "";
  let token = "";
  try {
    const body = (await request.json()) as {
      email?: string;
      token?: string;
    };
    email = body.email?.trim().toLowerCase() ?? "";
    token = body.token?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json(
      { error: "Invalid or expired unsubscribe link." },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const { data: rows } = await admin
      .from("email_leads")
      .select("id, nurture_emails")
      .eq("email", email);

    const now = new Date().toISOString();
    const { error } = await admin
      .from("email_leads")
      .update({ unsubscribed_at: now })
      .eq("email", email);

    if (error) {
      // Column may not exist yet — still try cancel scheduled sends
      console.warn("[unsubscribe] update:", error.message);
    }

    for (const row of rows ?? []) {
      const metas = (row.nurture_emails ?? []) as NurtureMeta[];
      for (const meta of metas) {
        if (meta?.id) await cancelResendEmail(meta.id);
      }
    }
  } catch (err) {
    console.error("[unsubscribe]", err);
    return NextResponse.json({ error: "Could not unsubscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
