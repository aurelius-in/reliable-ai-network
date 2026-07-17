import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withProfileRepair } from "@/lib/supabase/ensure-profile";
import { MILESTONES } from "@/lib/milestones";

/** Toggles a milestone in the Progress Tracker (Growth). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { milestone?: string; completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const milestone = body.milestone;
  const completed = body.completed === true;
  if (!milestone || !MILESTONES.some((m) => m.id === milestone)) {
    return NextResponse.json({ error: "Unknown milestone" }, { status: 400 });
  }

  const { error } = await withProfileRepair(user, () =>
    supabase.from("progress_logs").upsert(
      {
        user_id: user.id,
        milestone,
        completed,
        date: new Date().toISOString(),
      },
      { onConflict: "user_id,milestone" }
    )
  );

  if (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json(
      { error: "Could not save progress. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ milestone, completed });
}
