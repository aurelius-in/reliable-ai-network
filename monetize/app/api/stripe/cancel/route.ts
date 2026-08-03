import { NextResponse } from "next/server";
import { applyRetentionKeepOffer } from "@/lib/access-code-server";
import { isComplimentaryStatus } from "@/lib/access-codes";
import {
  cancelStripeSubscription,
  findManageableSubscription,
} from "@/lib/stripe-billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/track-server";

export const maxDuration = 60;

type Action = "accept_retention" | "confirm_cancel";

/**
 * In-app cancel path (not Stripe portal).
 * - accept_retention: cancel Stripe billing, grant RAIN60KEEP (60 days Pro)
 * - confirm_cancel: cancel Stripe billing, end access
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let action: Action | null = null;
  try {
    const body = await request.json();
    if (body?.action === "accept_retention" || body?.action === "confirm_cancel") {
      action = body.action;
    }
  } catch {
    /* empty */
  }

  if (!action) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, subscription_status, current_tier")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (isComplimentaryStatus(profile.subscription_status)) {
    return NextResponse.json(
      {
        error:
          "This account is already on complimentary access. No paid subscription to cancel.",
      },
      { status: 409 }
    );
  }

  const status = profile.subscription_status;
  if (!status || status === "canceled") {
    return NextResponse.json(
      { error: "No active subscription to cancel." },
      { status: 400 }
    );
  }

  if (!profile.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account found." },
      { status: 400 }
    );
  }

  try {
    const sub = await findManageableSubscription(profile.stripe_customer_id);

    if (action === "accept_retention") {
      // Grant first so webhook skip protects complimentary status.
      const grant = await applyRetentionKeepOffer(admin, user.id);
      if (!grant.ok) {
        return NextResponse.json(
          { error: grant.error },
          { status: grant.status }
        );
      }

      if (sub && ["active", "trialing", "past_due", "unpaid"].includes(sub.status)) {
        await cancelStripeSubscription(sub.id);
      }

      void trackServer(
        "cancel_retention_accepted",
        {
          code: grant.grant.code,
          days: grant.grant.durationDays,
          prior_status: status,
        },
        { userId: user.id, path: "/api/stripe/cancel" }
      );

      return NextResponse.json({
        ok: true,
        outcome: "retention",
        label: grant.grant.label,
        endsAt: grant.endsAt,
        tier: grant.grant.tier,
      });
    }

    // confirm_cancel
    if (sub && ["active", "trialing", "past_due", "unpaid"].includes(sub.status)) {
      await cancelStripeSubscription(sub.id);
    }

    await admin
      .from("profiles")
      .update({
        current_tier: null,
        subscription_status: "canceled",
        trial_ends_at: null,
      })
      .eq("id", user.id);

    void trackServer(
      "cancel_confirmed",
      { prior_status: status },
      { userId: user.id, path: "/api/stripe/cancel" }
    );

    return NextResponse.json({ ok: true, outcome: "canceled" });
  } catch (err) {
    console.error("Cancel flow failed:", err);
    return NextResponse.json(
      { error: "Could not complete cancellation. Please try again." },
      { status: 500 }
    );
  }
}
