import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveCreation } from "@/lib/tool-request";
import { runDemandScan } from "@/lib/demand-discovery/scan";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 120;

/**
 * Demand discovery / Daily Market Research scan (Starter): 25+ public communities.
 * Surfaces conversations with intent scores and outreach drafts.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    creationId?: string;
    title?: string;
    description?: string;
    type?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const resolved = await resolveCreation(supabase, user.id, body);
  if ("error" in resolved) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.status }
    );
  }

  try {
    const result = await runDemandScan(resolved.creation, { maxSignals: 12 });

    if (resolved.creation.id) {
      const { error: assetError } = await supabase
        .from("generated_assets")
        .insert({
          user_id: user.id,
          creation_id: resolved.creation.id,
          type: "demand_scan",
          content: result,
        });
      if (assetError) {
        console.error("[demand-discovery] persist", assetError.message);
      }
    }

    trackToolRun(
      "demand_discovery",
      {
        signals: result.signals.length,
        providers: result.providerNotes.join(",").slice(0, 200),
      },
      { userId: user.id, path: "/api/demand-discovery/scan" }
    );

    return NextResponse.json({ result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Demand scan failed";
    console.error("[demand-discovery]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
