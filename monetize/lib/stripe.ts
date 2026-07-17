import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

/**
 * Lazily construct the Stripe client at request time so builds
 * succeed without STRIPE_SECRET_KEY present.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export type Tier = "starter" | "growth" | "pro";

export function getPriceIdForTier(tier: Tier): string {
  const priceId = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    pro: process.env.STRIPE_PRICE_PRO,
  }[tier];

  if (!priceId) {
    throw new Error(`Stripe price ID for tier "${tier}" is not configured`);
  }
  return priceId;
}

/** Map a Stripe price ID back to our tier name. */
export function getTierForPriceId(priceId: string | undefined): Tier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
