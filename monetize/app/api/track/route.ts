import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const MAX_NAME = 80;
const MAX_PATH = 400;
const MAX_REF = 400;
const MAX_SESSION = 80;
const MAX_UTM = 120;

type Body = {
  name?: unknown;
  path?: unknown;
  referrer?: unknown;
  session_id?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  props?: unknown;
  user_id?: unknown;
};

function asTrimmedString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().slice(0, max);
  return t.length ? t : null;
}

/**
 * POST /api/track
 * Public beacon for page views + funnel events. Service-role insert only.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = asTrimmedString(body.name, MAX_NAME);
  if (!name || !/^[a-z][a-z0-9_]{1,78}$/i.test(name)) {
    return NextResponse.json({ ok: false, error: "bad name" }, { status: 400 });
  }

  const props =
    body.props && typeof body.props === "object" && !Array.isArray(body.props)
      ? (body.props as Record<string, unknown>)
      : {};

  // Cap props size / depth lightly
  const safeProps: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props).slice(0, 20)) {
    if (typeof v === "string") safeProps[k.slice(0, 40)] = v.slice(0, 200);
    else if (typeof v === "number" && Number.isFinite(v)) safeProps[k.slice(0, 40)] = v;
    else if (typeof v === "boolean") safeProps[k.slice(0, 40)] = v;
    else if (v === null) safeProps[k.slice(0, 40)] = null;
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("analytics_events").insert({
      name: name.toLowerCase(),
      path: asTrimmedString(body.path, MAX_PATH),
      referrer: asTrimmedString(body.referrer, MAX_REF),
      session_id: asTrimmedString(body.session_id, MAX_SESSION),
      utm_source: asTrimmedString(body.utm_source, MAX_UTM),
      utm_medium: asTrimmedString(body.utm_medium, MAX_UTM),
      utm_campaign: asTrimmedString(body.utm_campaign, MAX_UTM),
      user_id:
        typeof body.user_id === "string" &&
        /^[0-9a-f-]{36}$/i.test(body.user_id)
          ? body.user_id
          : null,
      props: safeProps,
    });

    if (error) {
      // Table missing until migration runs — don't break the product.
      console.error("[track]", error.message);
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track]", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
