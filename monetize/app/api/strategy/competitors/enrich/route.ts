import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apolloFindCompany, isApolloConfigured } from "@/lib/apollo";
import { trackToolRun } from "@/lib/track-server";

export const maxDuration = 60;

/**
 * POST /api/strategy/competitors/enrich
 * Enrich competitor names from Strategy Tools with Apollo company data.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isApolloConfigured()) {
    return NextResponse.json(
      {
        error:
          "Company enrich is not configured yet. Add APOLLO_API_KEY to enable it.",
      },
      { status: 503 }
    );
  }

  let body: { competitors?: { name: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const competitors = (body.competitors ?? [])
    .map((c) => ({ name: String(c?.name ?? "").trim() }))
    .filter((c) => c.name)
    .slice(0, 6);

  if (competitors.length === 0) {
    return NextResponse.json(
      { error: "competitors with name are required" },
      { status: 400 }
    );
  }

  try {
    const enriched = [];
    for (const competitor of competitors) {
      const company = await apolloFindCompany(competitor.name);
      enriched.push({
        inputName: competitor.name,
        company,
      });
    }

    trackToolRun("strategy", { action: "enrich" }, {
      userId: user.id,
      path: "/api/strategy/competitors/enrich",
    });
    return NextResponse.json({
      count: enriched.filter((e) => e.company).length,
      results: enriched,
    });
  } catch (err) {
    console.error("[strategy/competitors/enrich]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Company enrich failed. Try again.",
      },
      { status: 502 }
    );
  }
}
