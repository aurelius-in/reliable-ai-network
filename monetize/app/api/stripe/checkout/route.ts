import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyReferralCode, ensureReferralCode } from "@/lib/referral-server";
import { getStripe, getPriceIdForTier, getAppUrl, type Tier } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProfile } from "@/lib/supabase/ensure-profile";

/**
 * Creates a subscription Checkout Session in embedded mode.
 * Returns clientSecret for mounting Checkout on /checkout.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let tier: Tier = "pro";
  let referralCode: string | null = null;
  try {
    const body = await request.json();
    if (body?.tier === "starter" || body?.tier === "growth" || body?.tier === "pro") {
      tier = body.tier;
    }
    if (typeof body?.referralCode === "string") {
      referralCode = body.referralCode;
    }
  } catch {
    // Empty body → default to Pro trial.
  }

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl();
    await ensureProfile(user);
    const admin = createAdminClient();
    await ensureReferralCode(admin, user.id);
    if (referralCode) {
      await applyReferralCode(admin, user.id, referralCode);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_status, email, referred_by")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id ?? null;

    // Stale IDs happen after test→live switch or deleted Stripe customers.
    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId);
        if (existing.deleted) {
          customerId = null;
        }
      } catch (err) {
        const missing =
          err instanceof Error &&
          (/No such customer/i.test(err.message) ||
            (err as { code?: string }).code === "resource_missing");
        if (!missing) throw err;
        customerId = null;
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Trial for first-timers, canceled, or comps converting to paid.
    const status = profile?.subscription_status;
    const isNewSubscriber =
      !status ||
      status === "canceled" ||
      status === "reviewer" ||
      status === "retention";

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      payment_method_collection: "always",
      line_items: [{ price: getPriceIdForTier(tier), quantity: 1 }],
      subscription_data: {
        ...(isNewSubscriber ? { trial_period_days: 30 } : {}),
        metadata: {
          supabase_user_id: user.id,
          ...(profile?.referred_by
            ? { referred_by: profile.referred_by }
            : {}),
        },
      },
      allow_promotion_codes: true,
      return_url: `${appUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      // Embedded Checkout allows colors/name/font — not logo/icon (those are Dashboard-only).
      branding_settings: {
        display_name: "Make it RAIN",
        background_color: "#070a12",
        button_color: "#00a8c4",
        border_style: "rounded",
        font_family: "montserrat",
      },
    });

    if (!session.client_secret) {
      throw new Error("Checkout session missing client_secret");
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Checkout session failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
