import { sendEmail } from "@/lib/email";
import type { CheckoutUpsell } from "@/lib/checkout-upsells";

/**
 * Alert ops when a checkout includes Layer-2 add-ons (fulfillment queue).
 */
export async function notifyCheckoutUpsells(input: {
  email: string;
  userId?: string | null;
  tier: string;
  upsells: CheckoutUpsell[];
}): Promise<void> {
  if (!input.upsells.length) return;
  const to = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!to) return;

  const lines = input.upsells.map(
    (u) => `- ${u.name} ($${u.priceMonthly}/mo) — ${u.id}`
  );
  const text = [
    "Checkout add-ons selected (fulfill after trial / on activation)",
    "",
    `Customer: ${input.email}`,
    `User ID: ${input.userId ?? "—"}`,
    `Plan: ${input.tier}`,
    "",
    ...lines,
    "",
    "These are optional Layer-2 services. Confirm setup capacity before promising SLAs.",
  ].join("\n");

  await sendEmail({
    to,
    subject: `Checkout upsells: ${input.upsells.map((u) => u.id).join(", ")} — ${input.email}`,
    text,
    html: `<pre style="font-family:system-ui,sans-serif">${text}</pre>`,
  }).catch((err) => {
    console.error("[notify-checkout-upsells]", err);
  });
}
