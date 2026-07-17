import { createClient } from "@/lib/supabase/server";
import { hasTierAccess, type TierName } from "@/lib/tiers";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface ToolCreationInput {
  creationId?: string;
  title?: string;
  description?: string;
  type?: string;
}

export interface ResolvedCreation {
  /** Null when the tool ran on an inline example (not a saved creation). */
  id: string | null;
  title: string;
  description: string;
  type: string;
}

/**
 * Resolves the product a tool should run on: either a saved creation
 * (by id, ownership enforced) or inline title/description/type used by
 * one-tap "Try an example" flows.
 */
export async function resolveCreation(
  supabase: Supabase,
  userId: string,
  body: ToolCreationInput
): Promise<{ creation: ResolvedCreation } | { error: string; status: number }> {
  if (body.creationId) {
    const { data, error } = await supabase
      .from("creations")
      .select("id, title, description, type")
      .eq("id", body.creationId)
      .eq("user_id", userId)
      .single();
    if (error || !data) {
      return { error: "Creation not found", status: 404 };
    }
    return { creation: data };
  }

  const title = body.title?.trim();
  const description = body.description?.trim();
  if (!title || !description) {
    return {
      error: "creationId or title + description is required",
      status: 400,
    };
  }
  return {
    creation: {
      id: null,
      title,
      description,
      type: body.type?.trim() || "other",
    },
  };
}

/**
 * Verifies the signed-in user's tier unlocks a tool. Trial users are on
 * `current_tier = "pro"` while trialing, so the full toolkit works for them.
 */
export async function requireTier(
  supabase: Supabase,
  userId: string,
  required: TierName
): Promise<{ ok: true } | { error: string; status: number }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_tier")
    .eq("id", userId)
    .single();

  if (!hasTierAccess(profile?.current_tier, required)) {
    return {
      error: `This tool is part of the ${required === "pro" ? "Pro" : "Growth"} plan. Upgrade to unlock it.`,
      status: 403,
    };
  }
  return { ok: true };
}
