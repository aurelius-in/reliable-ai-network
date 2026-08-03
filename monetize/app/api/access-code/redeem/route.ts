import { NextResponse } from "next/server";
import { redeemAccessCode } from "@/lib/access-code-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { trackServer } from "@/lib/track-server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let code = "";
  try {
    const body = await request.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await ensureProfile(user);
  const admin = createAdminClient();
  const result = await redeemAccessCode(admin, user.id, code);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  void trackServer(
    "access_code_redeemed",
    {
      code: result.grant.code,
      tier: result.grant.tier,
      days: result.grant.durationDays,
    },
    { userId: user.id, path: "/api/access-code/redeem" }
  );

  if (!result.alreadyActive) {
    const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
    if (to) {
      const email = user.email ?? "unknown";
      const text = [
        "Reviewer / access code redeemed.",
        "",
        `Email: ${email}`,
        `User id: ${user.id}`,
        `Code: ${result.grant.code}`,
        `Label: ${result.grant.label}`,
        `Tier: ${result.grant.tier}`,
        `Ends: ${result.endsAt ?? "n/a"}`,
      ].join("\n");
      void sendEmail({
        to,
        subject: `Access redeemed: ${email} (${result.grant.code})`,
        text,
        html: `<pre style="font-family:system-ui,sans-serif">${text}</pre>`,
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    ok: true,
    tier: result.grant.tier,
    status: result.grant.status,
    label: result.grant.label,
    endsAt: result.endsAt,
    alreadyActive: result.alreadyActive === true,
    description: result.grant.description,
  });
}
