/**
 * Create new Stripe monthly prices at $15 / $30 / $60 on existing products.
 */
const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");

const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const key = env.match(/STRIPE_SECRET_KEY="?([^"\n]+)"?/)?.[1];
if (!key) throw new Error("STRIPE_SECRET_KEY missing");

const stripe = new Stripe(key);

const OLD = {
  starter: "price_1Tu3i033XWkeZRO7wIUHySzc",
  growth: "price_1Tu3i033XWkeZRO7m3hUd4G6",
  pro: "price_1Tu3i133XWkeZRO7aZmsLeXJ",
};

const NEW_AMOUNTS = { starter: 1500, growth: 3000, pro: 6000 };

async function main() {
  const out = {};
  for (const [tier, oldId] of Object.entries(OLD)) {
    const old = await stripe.prices.retrieve(oldId);
    const productId =
      typeof old.product === "string" ? old.product : old.product.id;
    const created = await stripe.prices.create({
      product: productId,
      unit_amount: NEW_AMOUNTS[tier],
      currency: "usd",
      recurring: { interval: "month" },
      nickname: `Make it RAIN ${tier} $${NEW_AMOUNTS[tier] / 100}/mo`,
      metadata: { tier, app: "make-it-rain" },
    });
    try {
      await stripe.products.update(productId, { default_price: created.id });
    } catch (_) {
      /* ignore */
    }
    out[tier] = created.id;
    console.log(
      tier,
      "old",
      old.unit_amount,
      "→",
      created.unit_amount,
      created.id,
      "livemode",
      created.livemode
    );
  }
  console.log("\n# Paste into .env.local / Vercel:");
  console.log(`STRIPE_PRICE_STARTER=${out.starter}`);
  console.log(`STRIPE_PRICE_GROWTH=${out.growth}`);
  console.log(`STRIPE_PRICE_PRO=${out.pro}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
