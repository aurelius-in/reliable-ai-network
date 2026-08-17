import { NextResponse } from "next/server";
import { openAccountForUse } from "@/lib/auth-open-account";
import { safeInternalNext } from "@/lib/safe-next";

/**
 * Opens password login without waiting on the confirmation email.
 * Does not return whether the email exists (same response either way).
 */
export async function POST(request: Request) {
  let body: { email?: string; userId?: string; next?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: true });
  }

  try {
    await openAccountForUse({
      email,
      userId: body.userId?.trim() || null,
      nextPath: safeInternalNext(body.next, ""),
    });
  } catch (err) {
    console.error("[open-account]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
