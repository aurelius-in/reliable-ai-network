import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withProfileRepair } from "@/lib/supabase/ensure-profile";

/**
 * Saves a new creation described inline from a tool tab's product picker.
 * Body: { title, description, type }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { title?: string; description?: string; type?: string };
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

  const { data, error } = await withProfileRepair(user, () =>
    supabase
      .from("creations")
      .insert({ user_id: user.id, title, description, type })
      .select("*")
      .single()
  );

  if (error || !data) {
    console.error("Failed to save creation:", error);
    return NextResponse.json(
      {
        error:
          "Failed to save your product. Please try again — if this keeps happening, contact support and mention your account email.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ creation: data });
}
