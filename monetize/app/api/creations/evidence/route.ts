import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractEvidenceExcerpt } from "@/lib/evidence-text";
import {
  CREATION_CONTEXT_SELECT,
  type EvidenceDoc,
} from "@/lib/product-context";

/**
 * Upload a text evidence file onto a creation.
 * multipart/form-data: creationId, file
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const creationId = String(form.get("creationId") ?? "").trim();
  const file = form.get("file");
  if (!creationId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "creationId and file are required" },
      { status: 400 }
    );
  }

  let excerpt: { name: string; mime: string; text_excerpt: string };
  try {
    excerpt = await extractEvidenceExcerpt(file);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not read file" },
      { status: 400 }
    );
  }

  const { data: existing, error: loadErr } = await supabase
    .from("creations")
    .select("id, evidence_docs")
    .eq("id", creationId)
    .eq("user_id", user.id)
    .single();

  if (loadErr || !existing) {
    return NextResponse.json({ error: "Creation not found" }, { status: 404 });
  }

  const prev = (existing.evidence_docs as EvidenceDoc[] | null) ?? [];
  const doc: EvidenceDoc = {
    ...excerpt,
    uploaded_at: new Date().toISOString(),
  };
  const evidence_docs = [...prev.filter((d) => d.name !== doc.name), doc].slice(
    -5
  );

  const { data, error } = await supabase
    .from("creations")
    .update({ evidence_docs })
    .eq("id", creationId)
    .eq("user_id", user.id)
    .select(`${CREATION_CONTEXT_SELECT}, user_id, created_at`)
    .single();

  if (error || !data) {
    console.error("Failed to save evidence:", error);
    return NextResponse.json(
      { error: "Failed to save evidence document" },
      { status: 500 }
    );
  }

  return NextResponse.json({ creation: data, doc });
}
