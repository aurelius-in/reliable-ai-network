import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { buildNurtureSequence } from "@/lib/nurture";
import { trackServer } from "@/lib/track-server";
import { unsubscribeUrl } from "@/lib/unsubscribe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      source?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const name = body.name?.trim() || null;
    const source = body.source?.trim() || "homepage_checklist";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    let already = false;
    let unsubscribed = false;
    try {
      const admin = createAdminClient();
      let existing: {
        id: string;
        checklist_sent_at: string | null;
        nurture_enrolled_at: string | null;
        unsubscribed_at?: string | null;
      } | null = null;

      const withUnsub = await admin
        .from("email_leads")
        .select("id, checklist_sent_at, nurture_enrolled_at, unsubscribed_at")
        .eq("email", email)
        .eq("source", source)
        .maybeSingle();

      if (withUnsub.error) {
        const fallback = await admin
          .from("email_leads")
          .select("id, checklist_sent_at, nurture_enrolled_at")
          .eq("email", email)
          .eq("source", source)
          .maybeSingle();
        existing = fallback.data;
      } else {
        existing = withUnsub.data;
      }

      if (existing?.unsubscribed_at) {
        unsubscribed = true;
      } else if (existing?.checklist_sent_at || existing?.nurture_enrolled_at) {
        already = true;
      } else {
        const now = new Date().toISOString();
        let { error } = await admin.from("email_leads").upsert(
          {
            email,
            name,
            source,
            checklist_sent_at: now,
            nurture_enrolled_at: now,
          },
          { onConflict: "email,source" }
        );
        // Fallback if nurture columns not migrated yet
        if (error) {
          ({ error } = await admin.from("email_leads").upsert(
            {
              email,
              name,
              source,
              checklist_sent_at: now,
            },
            { onConflict: "email,source" }
          ));
        }
        if (error) {
          console.warn("[checklist] email_leads upsert:", error.message);
        }
      }
    } catch (err) {
      console.warn("[checklist] email_leads unavailable:", err);
    }

    if (unsubscribed) {
      return NextResponse.json({
        ok: true,
        already: true,
        unsubscribed: true,
        message:
          "This email is unsubscribed from checkup messages. Reply to ai@reliableainetwork.com if you want back on the list.",
      });
    }

    if (!already) {
      const sequence = buildNurtureSequence({
        toName: name ?? undefined,
        toEmail: email,
      });
      const unsubHref = unsubscribeUrl(email, SITE);
      const scheduledMeta: {
        key: string;
        at: string;
        ok: boolean;
        id?: string;
      }[] = [];

      for (const msg of sequence) {
        const at =
          msg.delayHours <= 0
            ? undefined
            : new Date(
                Date.now() + msg.delayHours * 60 * 60 * 1000
              ).toISOString();

        const sent = await sendEmail({
          to: email,
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
          scheduledAt: at,
          listUnsubscribeUrl: unsubHref,
        });

        scheduledMeta.push({
          key: msg.key,
          at: at ?? new Date().toISOString(),
          ok: sent.sent,
          id: sent.id,
        });

        // First email must succeed
        if (msg.delayHours <= 0 && !sent.sent) {
          return NextResponse.json(
            {
              error:
                "Could not send email right now. Try again, or start a free trial instead.",
              reason: sent.reason,
            },
            { status: 502 }
          );
        }
      }

      try {
        const admin = createAdminClient();
        await admin
          .from("email_leads")
          .update({
            nurture_enrolled_at: new Date().toISOString(),
            nurture_emails: scheduledMeta,
            followup_sent_at: scheduledMeta.find((m) => m.key.includes("2"))
              ?.at,
          })
          .eq("email", email)
          .eq("source", source);
      } catch {
        /* ignore */
      }

      await trackServer(
        "nurture_enrolled",
        { source, emails: String(sequence.length) },
        { path: "/" }
      );
    }

    await trackServer(
      "checklist_signup",
      { source, already: already ? "1" : "0" },
      { path: "/" }
    );

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL?.trim();
    if (adminEmail && !already) {
      void sendEmail({
        to: adminEmail,
        subject: `Checklist + nurture: ${email}`,
        text: `${email} enrolled in the 5-email Make it RAIN nurture (${source}).`,
        html: `<p><strong>${email}</strong> enrolled in the 5-email nurture.</p>`,
      });
    }

    return NextResponse.json({
      ok: true,
      already,
      message: already
        ? "You're already on the list. Check your inbox for the checkup."
        : "Check your inbox for the Product Monetization Checkup. Four short follow-ups will arrive over the next week.",
    });
  } catch (err) {
    console.error("[checklist]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
