/**
 * Server-side analytics insert for API tool runs (service role).
 * Fire-and-forget; never throw into request handlers.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export async function trackServer(
  name: string,
  props: Record<string, string | number | boolean | null | undefined> = {},
  opts?: { path?: string; userId?: string | null }
): Promise<void> {
  try {
    const safeProps: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(props).slice(0, 20)) {
      if (typeof v === "string") safeProps[k.slice(0, 40)] = v.slice(0, 200);
      else if (typeof v === "number" && Number.isFinite(v))
        safeProps[k.slice(0, 40)] = v;
      else if (typeof v === "boolean") safeProps[k.slice(0, 40)] = v;
      else if (v === null) safeProps[k.slice(0, 40)] = null;
    }

    const admin = createAdminClient();
    const { error } = await admin.from("analytics_events").insert({
      name: name.toLowerCase().slice(0, 80),
      path: opts?.path?.slice(0, 400) ?? null,
      props: safeProps,
      user_id:
        opts?.userId && /^[0-9a-f-]{36}$/i.test(opts.userId)
          ? opts.userId
          : null,
    });
    if (error) console.error("[track-server]", error.message);
  } catch (err) {
    console.error("[track-server]", err);
  }
}

/** Record a successful tool generation/run. */
export function trackToolRun(
  tool: string,
  extra?: Record<string, string | number | boolean | null | undefined>,
  opts?: { path?: string; userId?: string | null }
): void {
  void trackServer("tool_run", { tool, ...extra }, opts);
}
