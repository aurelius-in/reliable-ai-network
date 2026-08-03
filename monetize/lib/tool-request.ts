import { isComplimentaryStatus } from "@/lib/access-codes";
import {
  CREATION_CONTEXT_SELECT,
  toProductContext,
  type ProductContext,
} from "@/lib/product-context";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasTierAccess, type TierName } from "@/lib/tiers";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface ToolCreationInput {
  creationId?: string;
  title?: string;
  description?: string;
  type?: string;
  stage?: string;
  traction?: string;
  current_price?: string;
  competitors_notes?: string;
  github_repo_url?: string;
}

/** Saved or inline product context for every tool prompt. */
export type ResolvedCreation = ProductContext & { id: string | null };

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
      .select(CREATION_CONTEXT_SELECT)
      .eq("id", body.creationId)
      .eq("user_id", userId)
      .single();
    if (error || !data) {
      return { error: "Creation not found", status: 404 };
    }
    const ctx = toProductContext(data as Record<string, unknown>);
    return { creation: { ...ctx, id: ctx.id ?? body.creationId } };
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
      stage: body.stage?.trim() || null,
      traction: body.traction?.trim() || null,
      current_price: body.current_price?.trim() || null,
      competitors_notes: body.competitors_notes?.trim() || null,
      evidence_docs: [],
      github_repo_url: body.github_repo_url?.trim() || null,
      github_context: null,
      product_url: null,
      website_context: null,
    },
  };
}

/**
 * Verifies the signed-in user's tier unlocks a tool. Trial and
 * complimentary users sit on `current_tier = "pro"` while access is active.
 */
export async function requireTier(
  supabase: Supabase,
  userId: string,
  required: TierName
): Promise<{ ok: true } | { error: string; status: number }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_tier, subscription_status, trial_ends_at")
    .eq("id", userId)
    .single();

  if (
    isComplimentaryStatus(profile?.subscription_status) &&
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at).getTime() <= Date.now()
  ) {
    // Lazy expire complimentary access (service role).
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({
        current_tier: null,
        subscription_status: "canceled",
        trial_ends_at: null,
      })
      .eq("id", userId);
    return {
      error:
        "Your complimentary access has ended. Start a trial to keep using Pro tools.",
      status: 403,
    };
  }

  if (!hasTierAccess(profile?.current_tier, required)) {
    return {
      error: `This tool is part of the ${required === "pro" ? "Pro" : "Growth"} plan. Upgrade to unlock it.`,
      status: 403,
    };
  }
  return { ok: true };
}
