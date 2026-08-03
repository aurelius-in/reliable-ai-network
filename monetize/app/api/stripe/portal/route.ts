import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getAppUrl } from "@/lib/stripe";
import { getNoCancelPortalConfigurationId } from "@/lib/stripe-billing";

/**
 * Stripe Customer Portal for plan / payment updates.
 * Cancellation is disabled here — use the in-app cancel flow instead.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account yet. Start a trial first." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const configuration = await getNoCancelPortalConfigurationId();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getAppUrl()}/billing`,
      configuration,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Portal session failed:", err);
    return NextResponse.json(
      { error: "Could not open the billing portal. Please try again." },
      { status: 500 }
    );
  }
}
