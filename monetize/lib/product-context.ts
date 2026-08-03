/** Structured product context passed into every tool prompt. */

import type { WebsiteContext } from "@/lib/website-public";
import { formatWebsiteEvidenceLine } from "@/lib/website-public";

export type EvidenceDoc = {
  name: string;
  mime: string;
  text_excerpt: string;
  uploaded_at: string;
};

export type GithubContext = {
  fetched_at: string;
  full_name: string;
  description: string | null;
  default_branch: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  readme_excerpt: string;
  homepage: string | null;
};

export type ProductContext = {
  id?: string | null;
  title: string;
  description: string;
  type: string;
  stage?: string | null;
  traction?: string | null;
  current_price?: string | null;
  competitors_notes?: string | null;
  evidence_docs?: EvidenceDoc[] | null;
  github_repo_url?: string | null;
  github_context?: GithubContext | null;
  product_url?: string | null;
  website_context?: WebsiteContext | null;
};

export const CREATION_CONTEXT_SELECT =
  "id, title, description, type, stage, traction, current_price, competitors_notes, evidence_docs, github_repo_url, github_context, product_url, website_context";

export const STAGE_OPTIONS = [
  { value: "idea", label: "Idea / pre-build" },
  { value: "building", label: "Building" },
  { value: "beta", label: "Private / public beta" },
  { value: "launched", label: "Launched, little/no revenue" },
  { value: "revenue", label: "Has paying customers" },
] as const;

/** Evidence inventory for audit reports (not guesses). */
export function listEvidenceSources(input: ProductContext): string[] {
  const sources: string[] = ["Founder product description"];
  if (input.traction?.trim()) sources.push("Founder-reported traction");
  if (input.competitors_notes?.trim()) {
    sources.push("Founder-named competitors");
  }
  if (input.website_context) {
    sources.push(`Product URL scrape (${input.website_context.final_url})`);
  } else if (input.product_url?.trim()) {
    sources.push(`Product URL (not scraped): ${input.product_url.trim()}`);
  }
  if (input.github_context) {
    sources.push(`Public GitHub (${input.github_context.full_name})`);
  } else if (input.github_repo_url?.trim()) {
    sources.push(`GitHub URL (not fetched): ${input.github_repo_url.trim()}`);
  }
  for (const doc of input.evidence_docs ?? []) {
    sources.push(`Uploaded document: ${doc.name}`);
  }
  return sources;
}

/** Append-only product block for Grok user prompts. */
export function formatProductContextBlock(input: ProductContext): string {
  const lines = [
    `Product title: ${input.title}`,
    `Product type: ${input.type}`,
    `Description: ${input.description}`,
  ];

  if (input.stage) lines.push(`Stage: ${input.stage}`);
  if (input.current_price?.trim()) {
    lines.push(`Current price / packaging: ${input.current_price.trim()}`);
  }
  if (input.traction?.trim()) {
    lines.push(`Traction / metrics: ${input.traction.trim()}`);
  }
  if (input.competitors_notes?.trim()) {
    lines.push(`Known competitors / alternatives: ${input.competitors_notes.trim()}`);
  }
  if (input.product_url?.trim()) {
    lines.push(`Product URL: ${input.product_url.trim()}`);
  }
  if (input.website_context) {
    lines.push(formatWebsiteEvidenceLine(input.website_context));
  }
  if (input.github_repo_url?.trim()) {
    lines.push(`GitHub repo: ${input.github_repo_url.trim()}`);
  }
  if (input.github_context) {
    const g = input.github_context;
    lines.push(
      `GitHub summary: ${g.full_name}` +
        (g.language ? ` (${g.language})` : "") +
        (g.stars != null ? `, ${g.stars} stars` : "") +
        (g.description ? `. ${g.description}` : "")
    );
    if (g.topics?.length) {
      lines.push(`GitHub topics: ${g.topics.slice(0, 12).join(", ")}`);
    }
    if (g.readme_excerpt?.trim()) {
      lines.push(
        `README excerpt:\n"""\n${g.readme_excerpt.trim().slice(0, 3500)}\n"""`
      );
    }
  }

  const docs = input.evidence_docs ?? [];
  if (docs.length > 0) {
    lines.push("Uploaded evidence documents:");
    for (const doc of docs.slice(0, 5)) {
      lines.push(
        `--- ${doc.name} (${doc.mime}) ---\n${doc.text_excerpt.slice(0, 4000)}`
      );
    }
  }

  lines.push(
    "Evidence sources available for this run:",
    ...listEvidenceSources(input).map((s) => `- ${s}`),
    "Cite these sources when making claims. Mark anything not backed by them as an assumption."
  );

  return lines.join("\n");
}

export function toProductContext(
  row: Record<string, unknown>
): ProductContext {
  return {
    id: typeof row.id === "string" ? row.id : null,
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    type: String(row.type ?? "other"),
    stage: (row.stage as string | null) ?? null,
    traction: (row.traction as string | null) ?? null,
    current_price: (row.current_price as string | null) ?? null,
    competitors_notes: (row.competitors_notes as string | null) ?? null,
    evidence_docs: (row.evidence_docs as EvidenceDoc[] | null) ?? [],
    github_repo_url: (row.github_repo_url as string | null) ?? null,
    github_context: (row.github_context as GithubContext | null) ?? null,
    product_url: (row.product_url as string | null) ?? null,
    website_context: (row.website_context as WebsiteContext | null) ?? null,
  };
}
