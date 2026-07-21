import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apolloPeopleSearch, isApolloConfigured } from "@/lib/apollo";
import {
  audienceTextToApolloSearch,
  personaToApolloSearch,
} from "@/lib/apollo-icp";
import type { BuyerPersona } from "@/types";

export const maxDuration = 60;

/**
 * POST /api/buyers/leads
 * Enrich Find Your Buyers / Sales / Launch with Apollo people matches.
 * Accepts either a full persona or a targetBuyer/audience string.
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
          "Lead search is not configured yet. Add APOLLO_API_KEY to enable it.",
      },
      { status: 503 }
    );
  }

  let body: {
    persona?: BuyerPersona;
    targetBuyer?: string;
    audience?: string;
    productTitle?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const persona = body.persona;
  const audienceText =
    body.targetBuyer?.trim() ||
    body.audience?.trim() ||
    (persona ? `${persona.name} ${persona.who}` : "");

  if (!persona?.name && !audienceText) {
    return NextResponse.json(
      { error: "persona or targetBuyer/audience is required" },
      { status: 400 }
    );
  }

  try {
    const query = persona?.name
      ? personaToApolloSearch(persona)
      : audienceTextToApolloSearch(audienceText);
    const leads = await apolloPeopleSearch(query);

    return NextResponse.json({
      personaName: persona?.name ?? audienceText,
      query: {
        titles: query.personTitles,
        keywords: query.qKeywords,
        seniorities: query.personSeniorities,
        locations: query.personLocations ?? [],
      },
      leads,
      count: leads.length,
    });
  } catch (err) {
    console.error("[buyers/leads]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Lead search failed. Try again.",
      },
      { status: 502 }
    );
  }
}
