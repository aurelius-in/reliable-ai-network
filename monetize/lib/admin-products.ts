/**
 * Founder admin: load product submissions with user identity for review.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { EVIDENCE_ITEMS, type EvidenceAnswers } from "@/lib/evidence-quality";
import type { CommercialAnswer, IdeaAnalysis } from "@/types";

export type AdminFieldRow = {
  question: string;
  answer: string;
  /** observed = scraped/enriched; founder = user-entered; system = derived */
  source: "founder" | "observed" | "system";
};

export type AdminProductSubmission = {
  creationId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    tier: string | null;
    subscriptionStatus: string | null;
  };
  fields: AdminFieldRow[];
  evidenceChecklist: { question: string; answer: string }[];
  latestAnalysis: {
    at: string;
    commercialAnswer: CommercialAnswer | null;
    score: number | null;
    bigPromise: string | null;
  } | null;
};

function blank(v: unknown): string {
  if (v == null) return "—";
  const s = String(v).trim();
  return s || "—";
}

export async function loadAdminProductSubmissions(limit = 80): Promise<
  | { submissions: AdminProductSubmission[]; total: number }
  | { error: string }
> {
  try {
    const admin = createAdminClient();

    const { data: creations, error, count } = await admin
      .from("creations")
      .select(
        "id, user_id, title, description, type, stage, traction, current_price, competitors_notes, product_url, github_repo_url, evidence_docs, website_context, github_context, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { error: error.message };
    }
    if (!creations?.length) {
      return { submissions: [], total: count ?? 0 };
    }

    const userIds = [...new Set(creations.map((c) => c.user_id as string))];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email, name, current_tier, subscription_status")
      .in("id", userIds);

    const profileById = new Map(
      (profiles ?? []).map((p) => [p.id as string, p])
    );

    const creationIds = creations.map((c) => c.id as string);
    const { data: analyses } = await admin
      .from("generated_assets")
      .select("creation_id, content, created_at")
      .eq("type", "idea_analysis")
      .in("creation_id", creationIds)
      .order("created_at", { ascending: false });

    const latestByCreation = new Map<
      string,
      { content: Record<string, unknown>; created_at: string }
    >();
    for (const row of analyses ?? []) {
      const cid = row.creation_id as string | null;
      if (!cid || latestByCreation.has(cid)) continue;
      latestByCreation.set(cid, {
        content: (row.content ?? {}) as Record<string, unknown>,
        created_at: row.created_at as string,
      });
    }

    const submissions: AdminProductSubmission[] = creations.map((c) => {
      const profile = profileById.get(c.user_id as string);
      const website = c.website_context as {
        title?: string | null;
        meta_description?: string | null;
        final_url?: string | null;
      } | null;
      const github = c.github_context as {
        full_name?: string | null;
        description?: string | null;
        stars?: number | null;
      } | null;
      const docs = (c.evidence_docs as { name?: string }[] | null) ?? [];

      const fields: AdminFieldRow[] = [
        {
          question: "Product name",
          answer: blank(c.title),
          source: "founder",
        },
        {
          question: "Description / what they entered",
          answer: blank(c.description),
          source: "founder",
        },
        { question: "Type", answer: blank(c.type), source: "founder" },
        { question: "Stage", answer: blank(c.stage), source: "founder" },
        { question: "Traction", answer: blank(c.traction), source: "founder" },
        {
          question: "Current price",
          answer: blank(c.current_price),
          source: "founder",
        },
        {
          question: "Competitors / alternatives",
          answer: blank(c.competitors_notes),
          source: "founder",
        },
        {
          question: "Product URL",
          answer: blank(c.product_url),
          source: "founder",
        },
        {
          question: "GitHub URL",
          answer: blank(c.github_repo_url),
          source: "founder",
        },
        {
          question: "Uploaded evidence files",
          answer: docs.length
            ? docs.map((d) => d.name ?? "file").join(", ")
            : "—",
          source: "founder",
        },
        {
          question: "Scraped site title",
          answer: blank(website?.title),
          source: "observed",
        },
        {
          question: "Scraped site description",
          answer: blank(website?.meta_description),
          source: "observed",
        },
        {
          question: "GitHub repo (fetched)",
          answer: github?.full_name
            ? `${github.full_name}${github.stars != null ? ` · ${github.stars}★` : ""}`
            : "—",
          source: "observed",
        },
      ];

      const latest = latestByCreation.get(c.id as string);
      let evidenceChecklist: { question: string; answer: string }[] = [];
      let latestAnalysis: AdminProductSubmission["latestAnalysis"] = null;

      if (latest) {
        const content = latest.content as unknown as IdeaAnalysis & {
          evidence_checklist?: EvidenceAnswers;
        };
        const ca = content.commercial_answer ?? null;
        latestAnalysis = {
          at: latest.created_at,
          commercialAnswer: ca,
          score: typeof content.score === "number" ? content.score : null,
          bigPromise: content.big_promise ?? null,
        };
        const checklist = content.evidence_checklist;
        if (checklist && typeof checklist === "object") {
          evidenceChecklist = EVIDENCE_ITEMS.map((item) => ({
            question: item.label,
            answer: blank(checklist[item.id]),
          }));
        }
      }

      return {
        creationId: c.id as string,
        createdAt: c.created_at as string,
        user: {
          id: c.user_id as string,
          email: (profile?.email as string) || "(no email)",
          name: (profile?.name as string | null) ?? null,
          tier: (profile?.current_tier as string | null) ?? null,
          subscriptionStatus:
            (profile?.subscription_status as string | null) ?? null,
        },
        fields,
        evidenceChecklist,
        latestAnalysis,
      };
    });

    return { submissions, total: count ?? submissions.length };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to load submissions",
    };
  }
}
