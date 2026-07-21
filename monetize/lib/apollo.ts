/**
 * Apollo.io people + company client (ported from RoleFerry).
 * Docs: https://docs.apollo.io/reference/
 * Auth: x-api-key header. People search needs a master key.
 *
 * People flow (current Apollo API):
 * 1. POST /mixed_people/api_search  (free, obfuscated names, no LinkedIn)
 * 2. POST /people/bulk_match        (credits, full name + LinkedIn)
 * Legacy /mixed_people/search now returns 422 on this account.
 */

const APOLLO_BASE = "https://api.apollo.io/api/v1";

export type ApolloLead = {
  name: string;
  title: string;
  company: string | null;
  linkedinUrl: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  headline: string | null;
};

export type ApolloCompany = {
  name: string;
  domain: string | null;
  industry: string | null;
  employeeCount: number | null;
  revenue: string | null;
  foundedYear: number | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  keywords: string[] | null;
};

export type ApolloPeopleSearchInput = {
  personTitles?: string[];
  personSeniorities?: string[];
  personLocations?: string[];
  qKeywords?: string;
  organizationName?: string;
  perPage?: number;
  page?: number;
};

function apolloHeaders(apiKey: string): HeadersInit {
  return {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Accept: "application/json",
  };
}

function requireApolloKey(): string {
  const apiKey = process.env.APOLLO_API_KEY?.trim();
  if (!apiKey) throw new Error("APOLLO_API_KEY is not configured");
  return apiKey;
}

export function isApolloConfigured(): boolean {
  return Boolean(process.env.APOLLO_API_KEY?.trim());
}

export async function apolloPeopleSearch(
  input: ApolloPeopleSearchInput
): Promise<ApolloLead[]> {
  const apiKey = requireApolloKey();

  const body: Record<string, unknown> = {
    per_page: Math.min(input.perPage ?? 15, 25),
    page: input.page ?? 1,
  };
  if (input.personTitles?.length) body.person_titles = input.personTitles;
  if (input.personSeniorities?.length) {
    body.person_seniorities = input.personSeniorities;
  }
  if (input.personLocations?.length) {
    body.person_locations = input.personLocations;
  }
  if (input.qKeywords?.trim()) body.q_keywords = input.qKeywords.trim();
  if (input.organizationName?.trim()) {
    body.q_organization_name = input.organizationName.trim();
  }

  // Current Apollo People API Search (free). Legacy mixed_people/search -> 422.
  const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
    method: "POST",
    headers: apolloHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    throw new Error("Apollo rate limit hit. Try again in a minute.");
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      "Apollo auth failed. Check APOLLO_API_KEY (master key needed for people search)."
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[apollo] api_search failed", res.status, text.slice(0, 300));
    throw new Error("Lead search failed. Please try again.");
  }

  const raw = (await res.json()) as { people?: unknown[] };
  const drafts = extractSearchPeople(raw);
  if (drafts.length === 0) return [];

  const enriched = await apolloBulkMatchPeople(
    apiKey,
    drafts.map((d) => d.id)
  );
  return drafts.map((draft) => {
    const match = enriched.get(draft.id);
    if (!match) return draft.lead;
    return {
      ...draft.lead,
      ...match,
      title: match.title || draft.lead.title,
      company: match.company || draft.lead.company,
    };
  });
}

/** Enrich prospect IDs into full name + LinkedIn (uses Apollo credits). */
async function apolloBulkMatchPeople(
  apiKey: string,
  ids: string[]
): Promise<Map<string, Partial<ApolloLead>>> {
  const out = new Map<string, Partial<ApolloLead>>();
  const cleanIds = ids.filter(Boolean).slice(0, 25);
  if (cleanIds.length === 0) return out;

  const res = await fetch(`${APOLLO_BASE}/people/bulk_match`, {
    method: "POST",
    headers: apolloHeaders(apiKey),
    body: JSON.stringify({
      details: cleanIds.map((id) => ({ id })),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[apollo] bulk_match failed", res.status, text.slice(0, 300));
    return out;
  }

  const data = (await res.json()) as { matches?: unknown[] };
  const matches = Array.isArray(data.matches) ? data.matches : [];
  for (const row of matches) {
    if (!row || typeof row !== "object") continue;
    const p = row as Record<string, unknown>;
    const id = String(p.id ?? "").trim();
    if (!id) continue;

    const name =
      String(p.name ?? "").trim() ||
      `${String(p.first_name ?? "").trim()} ${String(p.last_name ?? "").trim()}`.trim();
    const title = String(p.title ?? "").trim();
    const org =
      p.organization && typeof p.organization === "object"
        ? (p.organization as Record<string, unknown>)
        : {};

    let linkedin = String(p.linkedin_url ?? "").trim();
    if (linkedin && !linkedin.startsWith("http")) {
      linkedin = `https://www.linkedin.com/${linkedin.replace(/^\//, "")}`;
    }

    out.set(id, {
      name: name || undefined,
      title: title || undefined,
      company:
        String(org.name ?? p.organization_name ?? "").trim() || null,
      linkedinUrl: linkedin || null,
      email: String(p.email ?? "").trim() || null,
      city: String(p.city ?? "").trim() || null,
      state: String(p.state ?? "").trim() || null,
      country: String(p.country ?? "").trim() || null,
      headline: String(p.headline ?? "").trim() || null,
    });
  }

  return out;
}

/** Search companies by name, then optionally enrich the top match by domain. */
export async function apolloFindCompany(
  name: string
): Promise<ApolloCompany | null> {
  const apiKey = requireApolloKey();
  const trimmed = name.trim();
  if (!trimmed) return null;

  const searchRes = await fetch(`${APOLLO_BASE}/mixed_companies/search`, {
    method: "POST",
    headers: apolloHeaders(apiKey),
    body: JSON.stringify({
      q_organization_name: trimmed,
      per_page: 5,
      page: 1,
    }),
  });

  if (searchRes.status === 429) {
    throw new Error("Apollo rate limit hit. Try again in a minute.");
  }
  if (searchRes.status === 401 || searchRes.status === 403) {
    throw new Error(
      "Apollo auth failed. Check APOLLO_API_KEY (master key needed)."
    );
  }
  if (!searchRes.ok) {
    const text = await searchRes.text().catch(() => "");
    console.error(
      "[apollo] company_search failed",
      searchRes.status,
      text.slice(0, 300)
    );
    return null;
  }

  const raw = (await searchRes.json()) as {
    organizations?: unknown[];
    accounts?: unknown[];
  };
  const list = (raw.organizations ?? raw.accounts ?? []) as unknown[];
  const first = list.find((row) => row && typeof row === "object") as
    | Record<string, unknown>
    | undefined;
  if (!first) return null;

  const domain = String(first.primary_domain ?? first.website_url ?? "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();

  if (domain) {
    const enriched = await apolloCompanyEnrich(domain);
    if (enriched) return enriched;
  }

  return mapCompany(first, domain || null);
}

export async function apolloCompanyEnrich(
  domain: string
): Promise<ApolloCompany | null> {
  const apiKey = requireApolloKey();
  const clean = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();
  if (!clean) return null;

  const res = await fetch(
    `${APOLLO_BASE}/organizations/enrich?domain=${encodeURIComponent(clean)}`,
    {
      method: "GET",
      headers: apolloHeaders(apiKey),
    }
  );

  if ([401, 402, 403, 404, 429].includes(res.status)) {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json()) as { organization?: unknown };
  const org =
    data.organization && typeof data.organization === "object"
      ? (data.organization as Record<string, unknown>)
      : null;
  if (!org) return null;
  return mapCompany(org, clean);
}

function mapCompany(
  org: Record<string, unknown>,
  fallbackDomain: string | null
): ApolloCompany {
  return {
    name: String(org.name ?? "").trim() || "Unknown",
    domain: String(org.primary_domain ?? fallbackDomain ?? "").trim() || null,
    industry: String(org.industry ?? "").trim() || null,
    employeeCount:
      typeof org.estimated_num_employees === "number"
        ? org.estimated_num_employees
        : null,
    revenue: String(org.organization_revenue ?? "").trim() || null,
    foundedYear:
      typeof org.founded_year === "number" ? org.founded_year : null,
    linkedinUrl: String(org.linkedin_url ?? "").trim() || null,
    websiteUrl: String(org.website_url ?? "").trim() || null,
    city: String(org.city ?? "").trim() || null,
    state: String(org.state ?? "").trim() || null,
    country: String(org.country ?? "").trim() || null,
    keywords: Array.isArray(org.keywords)
      ? org.keywords.map((k) => String(k)).filter(Boolean).slice(0, 8)
      : null,
  };
}

function extractSearchPeople(raw: {
  people?: unknown[];
}): { id: string; lead: ApolloLead }[] {
  const people = Array.isArray(raw.people) ? raw.people : [];
  const out: { id: string; lead: ApolloLead }[] = [];

  for (const row of people) {
    if (!row || typeof row !== "object") continue;
    const p = row as Record<string, unknown>;
    const id = String(p.id ?? "").trim();
    const first = String(p.first_name ?? "").trim();
    const last =
      String(p.last_name ?? "").trim() ||
      String(p.last_name_obfuscated ?? "").trim();
    const name = `${first} ${last}`.trim();
    const title = String(p.title ?? "").trim();
    if (!id || !name || !title) continue;

    const org =
      p.organization && typeof p.organization === "object"
        ? (p.organization as Record<string, unknown>)
        : {};

    out.push({
      id,
      lead: {
        name,
        title,
        company: String(org.name ?? p.organization_name ?? "").trim() || null,
        linkedinUrl: null,
        email: null,
        city: String(p.city ?? "").trim() || null,
        state: String(p.state ?? "").trim() || null,
        country: String(p.country ?? "").trim() || null,
        headline: String(p.headline ?? "").trim() || null,
      },
    });
  }

  return out;
}
