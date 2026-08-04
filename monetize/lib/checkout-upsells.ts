/**
 * GoDaddy-style optional add-ons at checkout.
 * Layer-2 services that improve the funnel — never required for the core plan.
 * See docs/service-ladder.md
 */

export type CheckoutUpsellId =
  | "ai_answering"
  | "content_pack"
  | "lead_pack"
  | "outreach_setup";

export type CheckoutUpsell = {
  id: CheckoutUpsellId;
  name: string;
  /** One-line need statement (why founders buy this). */
  need: string;
  detail: string;
  /** Monthly USD after trial (same 30-day trial as the plan). */
  priceMonthly: number;
  /** Soft highlight like GoDaddy “recommended”. */
  recommended?: boolean;
  /** Optional Stripe Price ID env override; otherwise price_data is used. */
  priceEnvKey?: string;
};

export const CHECKOUT_UPSELLS: CheckoutUpsell[] = [
  {
    id: "ai_answering",
    name: "AI answering service",
    need: "Never miss a buyer who calls or leaves a voicemail.",
    detail:
      "AI answers inbound calls and missed-call texts with your offer script, captures the lead, and routes hot ones to you. Setup from your Product Brief.",
    priceMonthly: 49,
    recommended: true,
    priceEnvKey: "STRIPE_PRICE_ADDON_AI_ANSWERING",
  },
  {
    id: "content_pack",
    name: "Content production pack",
    need: "Stay visible without spending nights writing posts.",
    detail:
      "Weekly LinkedIn/X drafts from your real story and ICP, ready to approve and publish. You keep the voice; we remove the blank-page work.",
    priceMonthly: 79,
    recommended: true,
    priceEnvKey: "STRIPE_PRICE_ADDON_CONTENT_PACK",
  },
  {
    id: "lead_pack",
    name: "Named lead sourcing",
    need: "Know who to message this week — not a vague “target market.”",
    detail:
      "Specialist-built lead list from your ICP, with outreach-ready notes. Complements Apollo matches inside the app.",
    priceMonthly: 99,
    priceEnvKey: "STRIPE_PRICE_ADDON_LEAD_PACK",
  },
  {
    id: "outreach_setup",
    name: "Outreach campaign setup",
    need: "Get a runnable outbound sequence instead of a plan that sits in a doc.",
    detail:
      "Sequences, talk tracks, and channel setup from your buyers and offer — so you (or your AE) can start conversations this week.",
    priceMonthly: 69,
    priceEnvKey: "STRIPE_PRICE_ADDON_OUTREACH_SETUP",
  },
];

const BY_ID = Object.fromEntries(
  CHECKOUT_UPSELLS.map((u) => [u.id, u])
) as Record<CheckoutUpsellId, CheckoutUpsell>;

export function isCheckoutUpsellId(id: string): id is CheckoutUpsellId {
  return id in BY_ID;
}

export function resolveCheckoutUpsells(
  ids: string[] | null | undefined
): CheckoutUpsell[] {
  if (!ids?.length) return [];
  const seen = new Set<CheckoutUpsellId>();
  const out: CheckoutUpsell[] = [];
  for (const raw of ids) {
    if (!isCheckoutUpsellId(raw) || seen.has(raw)) continue;
    seen.add(raw);
    out.push(BY_ID[raw]);
  }
  return out;
}

export function upsellMonthlyTotal(upsells: CheckoutUpsell[]): number {
  return upsells.reduce((n, u) => n + u.priceMonthly, 0);
}

/** Env-configured Stripe Price ID, if any. */
export function getUpsellStripePriceId(upsell: CheckoutUpsell): string | null {
  if (!upsell.priceEnvKey) return null;
  const id = process.env[upsell.priceEnvKey]?.trim();
  return id || null;
}
