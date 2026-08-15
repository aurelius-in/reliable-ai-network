import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withProfileRepair } from "@/lib/supabase/ensure-profile";
import { grokChatJSON } from "@/lib/grok";
import {
  IDEA_ANALYZER_SYSTEM_PROMPT,
  buildIdeaAnalyzerUserPrompt,
} from "@/prompts/idea-analyzer";
import type { EvidenceAnswers } from "@/lib/evidence-quality";
import type { IdeaAnalysis } from "@/types";
import { trackToolRun } from "@/lib/track-server";
import {
  CREATION_CONTEXT_SELECT,
  toProductContext,
  type ProductContext,
} from "@/lib/product-context";
import {
  enrichCompetitorNames,
  formatApolloCompetitorsForPrompt,
  parseCompetitorNames,
} from "@/lib/competitor-enrich";

export const maxDuration = 300;

const STAGES = new Set(["idea", "building", "beta", "launched", "revenue"]);

/**
 * Runs the Idea Analyzer.
 * Body: { creationId } to re-run on an existing creation,
 * or { title, description, type, ...expert } to create a creation and analyze it.
 * Optional evidenceChecklist answers are graded into the prompt.
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
    stage?: string;
    traction?: string;
    current_price?: string;
    competitors_notes?: string;
    github_repo_url?: string;
    product_url?: string;
    evidenceChecklist?: EvidenceAnswers;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let creation: ProductContext & { id: string };

  if (body.creationId) {
    const { data, error } = await supabase
      .from("creations")
      .select(CREATION_CONTEXT_SELECT)
      .eq("id", body.creationId)
      .eq("user_id", user.id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }
    const ctx = toProductContext(data as Record<string, unknown>);
    creation = { ...ctx, id: body.creationId };
  } else {
    const title = body.title?.trim();
    const description = body.description?.trim();
    const type = body.type?.trim() || "other";
    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description are required" },
        { status: 400 }
      );
    }
    const stage = body.stage?.trim() || null;
    const row = {
      user_id: user.id,
      title,
      description,
      type,
      stage: stage && STAGES.has(stage) ? stage : null,
      traction: body.traction?.trim() || null,
      current_price: body.current_price?.trim() || null,
      competitors_notes: body.competitors_notes?.trim() || null,
      github_repo_url: body.github_repo_url?.trim() || null,
      product_url: body.product_url?.trim() || null,
    };
    const { data, error } = await withProfileRepair(user, () =>
      supabase
        .from("creations")
        .insert(row)
        .select(CREATION_CONTEXT_SELECT)
        .single()
    );
    if (error || !data) {
      console.error("Failed to save creation:", error);
      return NextResponse.json(
        {
          error:
            "Failed to save creation. Please try again — if this keeps happening, contact support and mention your account email.",
        },
        { status: 500 }
      );
    }
    const ctx = toProductContext(data as Record<string, unknown>);
    creation = { ...ctx, id: String(data.id) };
  }

  const competitorNames = parseCompetitorNames(creation.competitors_notes);
  const enrichment = await enrichCompetitorNames(competitorNames);
  const apolloBlock = formatApolloCompetitorsForPrompt(enrichment);

  let analysis: IdeaAnalysis;
  try {
    analysis = await grokChatJSON<IdeaAnalysis>([
      { role: "system", content: IDEA_ANALYZER_SYSTEM_PROMPT },
      {
        role: "user",
        content: buildIdeaAnalyzerUserPrompt(creation, {
          evidenceChecklist: body.evidenceChecklist ?? null,
          apolloCompetitors: apolloBlock || null,
        }),
      },
    ]);
  } catch (err) {
    console.error("Idea Analyzer failed:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  if (enrichment.length > 0) {
    analysis = {
      ...analysis,
      competitor_enrichment: enrichment,
    };
  }

  // Persist intake answers for founder review (/admin/products).
  const evidenceChecklist = body.evidenceChecklist ?? null;
  const contentToStore = {
    ...analysis,
    ...(evidenceChecklist
      ? { evidence_checklist: evidenceChecklist }
      : {}),
    intake_snapshot: {
      title: creation.title,
      description: creation.description,
      type: creation.type,
      stage: creation.stage ?? null,
      traction: creation.traction ?? null,
      current_price: creation.current_price ?? null,
      competitors_notes: creation.competitors_notes ?? null,
      product_url: creation.product_url ?? null,
      github_repo_url: creation.github_repo_url ?? null,
      captured_at: new Date().toISOString(),
    },
  };

  const { data: asset, error: assetError } = await withProfileRepair(user, () =>
    supabase
      .from("generated_assets")
      .insert({
        user_id: user.id,
        creation_id: creation.id,
        type: "idea_analysis",
        content: contentToStore,
      })
      .select("id, created_at")
      .single()
  );

  if (assetError) {
    console.error("Failed to persist analysis:", assetError);
  }

  trackToolRun("analyzer", {}, { userId: user.id, path: "/api/analyze" });
  return NextResponse.json({
    creationId: creation.id,
    assetId: asset?.id ?? null,
    analysis,
  });
}
