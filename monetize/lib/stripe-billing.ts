import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

const MANAGEABLE = new Set(["active", "trialing", "past_due", "unpaid"]);

export async function findManageableSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  const listed = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });
  return (
    listed.data.find((s) => MANAGEABLE.has(s.status)) ??
    listed.data.find((s) => s.status === "canceled") ??
    null
  );
}

export async function cancelStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Portal config that allows plan/payment changes but not cancel
 * (cancel is handled in-app with retention friction).
 */
export async function getNoCancelPortalConfigurationId(): Promise<string> {
  const stripe = getStripe();
  const fromEnv = process.env.STRIPE_PORTAL_CONFIGURATION_ID?.trim();
  if (fromEnv) return fromEnv;

  const existing = await stripe.billingPortal.configurations.list({ limit: 20 });
  const match = existing.data.find(
    (c) =>
      c.active &&
      c.features.subscription_cancel?.enabled === false &&
      c.features.payment_method_update?.enabled !== false
  );
  if (match) return match.id;

  const created = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your Make it RAIN subscription",
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address"],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      // Cancel only via in-app retention flow.
      subscription_cancel: { enabled: false },
      // Plan changes: send users to /pricing + checkout (avoids portal product config).
      subscription_update: { enabled: false },
    },
  });
  return created.id;
}
