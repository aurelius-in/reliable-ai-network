import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getTierForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

/**
 * Stripe webhook — the source of truth for billing state.
 * Verifies the raw-body signature, then syncs tier / status /
 * trial_ends_at into profiles and logs to billing_events.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (userId && subscriptionId) {
          const subscription =
            await getStripe().subscriptions.retrieve(subscriptionId);
          await syncSubscriptionToProfile(admin, userId, subscription);
        }

        await logBillingEvent(admin, {
          userId: userId ?? (await userIdFromCustomer(admin, session.customer)),
          eventId: event.id,
          type: event.type,
          amount: session.amount_total,
          status: session.status ?? "complete",
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId =
          subscription.metadata?.supabase_user_id ||
          (await userIdFromCustomer(admin, subscription.customer));

        if (userId) {
          if (event.type === "customer.subscription.deleted") {
            await admin
              .from("profiles")
              .update({
                current_tier: null,
                subscription_status: "canceled",
                trial_ends_at: null,
              })
              .eq("id", userId);
          } else {
            await syncSubscriptionToProfile(admin, userId, subscription);
          }
        }

        await logBillingEvent(admin, {
          userId,
          eventId: event.id,
          type: event.type,
          amount: null,
          status: subscription.status,
        });
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await userIdFromCustomer(admin, invoice.customer);

        if (userId && event.type === "invoice.payment_failed") {
          await admin
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", userId);
        }
        // On success the paired customer.subscription.updated event syncs
        // full state; we only need the audit log here.

        await logBillingEvent(admin, {
          userId,
          eventId: event.id,
          type: event.type,
          amount:
            event.type === "invoice.payment_succeeded"
              ? invoice.amount_paid
              : invoice.amount_due,
          status: event.type === "invoice.payment_succeeded" ? "paid" : "failed",
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`Webhook handler failed for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function syncSubscriptionToProfile(
  admin: AdminClient,
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = getTierForPriceId(priceId);

  await admin
    .from("profiles")
    .update({
      current_tier: tier,
      subscription_status: subscription.status,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq("id", userId);
}

async function userIdFromCustomer(
  admin: AdminClient,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Promise<string | null> {
  const customerId = typeof customer === "string" ? customer : customer?.id;
  if (!customerId) return null;

  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.id ?? null;
}

async function logBillingEvent(
  admin: AdminClient,
  entry: {
    userId: string | null;
    eventId: string;
    type: string;
    amount: number | null;
    status: string;
  }
) {
  // stripe_event_id is unique — upsert makes webhook retries idempotent.
  await admin.from("billing_events").upsert(
    {
      user_id: entry.userId,
      stripe_event_id: entry.eventId,
      type: entry.type,
      amount: entry.amount,
      status: entry.status,
    },
    { onConflict: "stripe_event_id" }
  );
}
