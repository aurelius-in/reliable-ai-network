import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grokChatJSON } from "@/lib/grok";
import {
  IDEA_ANALYZER_SYSTEM_PROMPT,
  buildIdeaAnalyzerUserPrompt,
} from "@/prompts/idea-analyzer";
import type { IdeaAnalysis } from "@/types";

export const maxDuration = 300;

/**
 * Runs the Idea Analyzer.
 * Body: { creationId } to re-run on an existing creation,
 * or { title, description, type } to create a creation and analyze it.
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

  let creation: { id: string; title: string; description: string; type: string };

  if (body.creationId) {
    const { data, error } = await supabase
      .from("creations")
      .select("id, title, description, type")
      .eq("id", body.creationId)
      .eq("user_id", user.id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }
    creation = data;
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
    const { data, error } = await supabase
      .from("creations")
      .insert({ user_id: user.id, title, description, type })
      .select("id, title, description, type")
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to save creation" },
        { status: 500 }
      );
    }
    creation = data;
  }

  let analysis: IdeaAnalysis;
  try {
    analysis = await grokChatJSON<IdeaAnalysis>([
      { role: "system", content: IDEA_ANALYZER_SYSTEM_PROMPT },
      { role: "user", content: buildIdeaAnalyzerUserPrompt(creation) },
    ]);
  } catch (err) {
    console.error("Idea Analyzer failed:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again in a moment." },
      { status: 502 }
    );
  }

  const { data: asset, error: assetError } = await supabase
    .from("generated_assets")
    .insert({
      user_id: user.id,
      creation_id: creation.id,
      type: "idea_analysis",
      content: analysis,
    })
    .select("id, created_at")
    .single();

  if (assetError) {
    console.error("Failed to persist analysis:", assetError);
  }

  return NextResponse.json({
    creationId: creation.id,
    assetId: asset?.id ?? null,
    analysis,
  });
}
