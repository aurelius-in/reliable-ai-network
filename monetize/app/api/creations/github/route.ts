import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPublicGithubContext } from "@/lib/github-public";
import { CREATION_CONTEXT_SELECT } from "@/lib/product-context";

/**
 * Fetch public GitHub context and attach it to a creation.
 * Body: { creationId, github_repo_url }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { creationId?: string; github_repo_url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const creationId = body.creationId?.trim();
  const github_repo_url = body.github_repo_url?.trim();
  if (!creationId || !github_repo_url) {
    return NextResponse.json(
      { error: "creationId and github_repo_url are required" },
      { status: 400 }
    );
  }

  let github_context;
  try {
    github_context = await fetchPublicGithubContext(github_repo_url);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not fetch that GitHub repo",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("creations")
    .update({ github_repo_url, github_context })
    .eq("id", creationId)
    .eq("user_id", user.id)
    .select(`${CREATION_CONTEXT_SELECT}, user_id, created_at`)
    .single();

  if (error || !data) {
    console.error("Failed to save github context:", error);
    return NextResponse.json(
      { error: "Failed to save GitHub context" },
      { status: 500 }
    );
  }

  return NextResponse.json({ creation: data, github_context });
}
