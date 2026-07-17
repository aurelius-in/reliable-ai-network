import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getPriceIdForTier, getAppUrl, type Tier } from "@/lib/stripe";

/**
 * Creates a subscription-mode Checkout Session.
 * Defaults to the Pro price with a 30-day trial and card collected
 * upfront, so day-31 charges happen automatically unless canceled.
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
  try {
    const body = await request.json();
    if (body?.tier === "starter" || body?.tier === "growth" || body?.tier === "pro") {
      tier = body.tier;
    }
  } catch {
    // Empty body → default to Pro trial.
  }

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_status, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id ?? null;

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

    // Only first-time subscribers get the 30-day trial.
    const isNewSubscriber = !profile?.subscription_status;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      payment_method_collection: "always",
      line_items: [{ price: getPriceIdForTier(tier), quantity: 1 }],
      subscription_data: {
        ...(isNewSubscriber ? { trial_period_days: 30 } : {}),
        metadata: { supabase_user_id: user.id },
      },
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
