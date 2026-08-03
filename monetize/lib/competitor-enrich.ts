import { apolloFindCompany, isApolloConfigured } from "@/lib/apollo";

/** Pull competitor names from free-text notes (comma / newline / "vs"). */
export function parseCompetitorNames(notes?: string | null): string[] {
  if (!notes?.trim()) return [];
  const chunks = notes
    .split(/[\n,;|/]|vs\.?|versus/gi)
    .map((s) => s.replace(/\(.*?\)/g, "").trim())
    .filter((s) => s.length >= 2 && s.length <= 60)
    .filter((s) => !/^(https?:|www\.)/i.test(s));
  const uniq: string[] = [];
  for (const c of chunks) {
    if (!uniq.some((u) => u.toLowerCase() === c.toLowerCase())) uniq.push(c);
    if (uniq.length >= 5) break;
  }
  return uniq;
}

export type CompetitorEnrichRow = {
  name: string;
  domain: string | null;
  industry: string | null;
  employeeCount: number | null;
  websiteUrl: string | null;
};

export async function enrichCompetitorNames(
  names: string[]
): Promise<CompetitorEnrichRow[]> {
  if (!isApolloConfigured() || names.length === 0) return [];
  const out: CompetitorEnrichRow[] = [];
  for (const name of names.slice(0, 5)) {
    try {
      const company = await apolloFindCompany(name);
      if (!company) {
        out.push({
          name,
          domain: null,
          industry: null,
          employeeCount: null,
          websiteUrl: null,
        });
        continue;
      }
      out.push({
        name: company.name || name,
        domain: company.domain,
        industry: company.industry,
        employeeCount: company.employeeCount,
        websiteUrl: company.websiteUrl,
      });
    } catch {
      out.push({
        name,
        domain: null,
        industry: null,
        employeeCount: null,
        websiteUrl: null,
      });
    }
  }
  return out;
}

export function formatApolloCompetitorsForPrompt(
  rows: CompetitorEnrichRow[]
): string {
  if (!rows.length) return "";
  return rows
    .map((r) => {
      const bits = [
        r.name,
        r.domain ? `domain=${r.domain}` : null,
        r.industry ? `industry=${r.industry}` : null,
        r.employeeCount != null ? `employees≈${r.employeeCount}` : null,
        r.websiteUrl ? `site=${r.websiteUrl}` : null,
      ].filter(Boolean);
      return `- ${bits.join(" · ")}`;
    })
    .join("\n");
}
