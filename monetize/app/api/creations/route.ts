import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withProfileRepair } from "@/lib/supabase/ensure-profile";
import { CREATION_CONTEXT_SELECT } from "@/lib/product-context";
import { fetchPublicGithubContext } from "@/lib/github-public";
import { fetchPublicWebsiteContext } from "@/lib/website-public";
import type { EvidenceDoc } from "@/lib/product-context";

const STAGES = new Set(["idea", "building", "beta", "launched", "revenue"]);

type CreationBody = {
  title?: string;
  description?: string;
  type?: string;
  stage?: string | null;
  traction?: string | null;
  current_price?: string | null;
  competitors_notes?: string | null;
  github_repo_url?: string | null;
  product_url?: string | null;
  evidence_docs?: EvidenceDoc[] | null;
  fetch_github?: boolean;
  fetch_website?: boolean;
};

function pickExpertFields(body: CreationBody) {
  const stage = body.stage?.trim() || null;
  return {
    stage: stage && STAGES.has(stage) ? stage : null,
    traction: body.traction?.trim() || null,
    current_price: body.current_price?.trim() || null,
    competitors_notes: body.competitors_notes?.trim() || null,
    github_repo_url: body.github_repo_url?.trim() || null,
    product_url: body.product_url?.trim() || null,
    evidence_docs: Array.isArray(body.evidence_docs)
      ? body.evidence_docs.slice(0, 5)
      : [],
  };
}

/**
 * Saves a new creation described inline from a tool tab's product picker.
 * Body: { title, description, type, stage?, traction?, ... }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: CreationBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim();
  const description = body.description?.trim();
  const type = body.type?.trim() || "other";
  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }

  const expert = pickExpertFields(body);
  let github_context = null as Awaited<
    ReturnType<typeof fetchPublicGithubContext>
  > | null;
  let website_context = null as Awaited<
    ReturnType<typeof fetchPublicWebsiteContext>
  > | null;
  if (body.fetch_github && expert.github_repo_url) {
    try {
      github_context = await fetchPublicGithubContext(expert.github_repo_url);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not fetch that GitHub repo",
        },
        { status: 400 }
      );
    }
  }
  if (body.fetch_website && expert.product_url) {
    try {
      website_context = await fetchPublicWebsiteContext(expert.product_url);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not fetch that product URL",
        },
        { status: 400 }
      );
    }
  }

  const { data, error } = await withProfileRepair(user, () =>
    supabase
      .from("creations")
      .insert({
        user_id: user.id,
        title,
        description,
        type,
        ...expert,
        github_context,
        website_context,
      })
      .select(`${CREATION_CONTEXT_SELECT}, user_id, created_at`)
      .single()
  );

  if (error || !data) {
    console.error("Failed to save creation:", error);
    const missingCol =
      typeof error?.message === "string" &&
      /column .* does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missingCol
          ? "Database is missing fields. Run supabase/creations_expert.sql and supabase/creations_website.sql in the Supabase SQL editor, then try again."
          : "Failed to save your product. Please try again — if this keeps happening, contact support and mention your account email.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ creation: data });
}

/**
 * Patch an existing creation (evidence docs, github, expert fields).
 * Body: { id, ...fields }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: CreationBody & { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined)
    updates.description = body.description.trim();
  if (body.type !== undefined) updates.type = body.type.trim() || "other";
  if (body.stage !== undefined) {
    const stage = body.stage?.trim() || null;
    updates.stage = stage && STAGES.has(stage) ? stage : null;
  }
  if (body.traction !== undefined)
    updates.traction = body.traction?.trim() || null;
  if (body.current_price !== undefined)
    updates.current_price = body.current_price?.trim() || null;
  if (body.competitors_notes !== undefined)
    updates.competitors_notes = body.competitors_notes?.trim() || null;
  if (body.github_repo_url !== undefined)
    updates.github_repo_url = body.github_repo_url?.trim() || null;
  if (body.product_url !== undefined)
    updates.product_url = body.product_url?.trim() || null;
  if (body.evidence_docs !== undefined) {
    updates.evidence_docs = Array.isArray(body.evidence_docs)
      ? body.evidence_docs.slice(0, 5)
      : [];
  }

  if (body.fetch_website) {
    const url =
      (updates.product_url as string | null | undefined) ??
      body.product_url?.trim();
    if (!url) {
      return NextResponse.json(
        { error: "product_url is required to fetch website context" },
        { status: 400 }
      );
    }
    try {
      updates.product_url = url;
      updates.website_context = await fetchPublicWebsiteContext(url);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not fetch that product URL",
        },
        { status: 400 }
      );
    }
  }

  if (body.fetch_github) {
    const url =
      (updates.github_repo_url as string | null | undefined) ??
      body.github_repo_url?.trim();
    if (!url) {
      return NextResponse.json(
        { error: "github_repo_url is required to fetch GitHub context" },
        { status: 400 }
      );
    }
    try {
      updates.github_repo_url = url;
      updates.github_context = await fetchPublicGithubContext(url);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not fetch that GitHub repo",
        },
        { status: 400 }
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("creations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`${CREATION_CONTEXT_SELECT}, user_id, created_at`)
    .single();

  if (error || !data) {
    console.error("Failed to update creation:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ creation: data });
}
