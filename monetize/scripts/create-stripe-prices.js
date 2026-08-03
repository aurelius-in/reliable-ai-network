/**
 * Create new Stripe monthly prices: $29 / $79 / $149
 * Prints only price IDs (no secrets).
 */
const fs = require("fs");
const path = require("path");

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, "");
  }
  return env;
}

async function main() {
  const root = path.join(__dirname, "..");
  const env = {
    ...loadEnv(path.join(root, ".env.check")),
    ...loadEnv(path.join(root, ".env.local")),
  };
  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("Missing STRIPE_SECRET_KEY");
    process.exit(1);
  }

  async function createPrice(nickname, unitAmount) {
    const body = new URLSearchParams({
      currency: "usd",
      unit_amount: String(unitAmount),
      "recurring[interval]": "month",
      product_data: JSON.stringify({
        name: `Make it RAIN ${nickname}`,
      }),
      nickname: `rain_${nickname.toLowerCase()}_${unitAmount}`,
      "metadata[tier]": nickname.toLowerCase(),
    });
    // Stripe wants product_data[name] form
    const form = new URLSearchParams();
    form.set("currency", "usd");
    form.set("unit_amount", String(unitAmount));
    form.set("recurring[interval]", "month");
    form.set("product_data[name]", `Make it RAIN ${nickname}`);
    form.set("nickname", `rain_${nickname.toLowerCase()}_${unitAmount}`);
    form.set("metadata[tier]", nickname.toLowerCase());

    const res = await fetch("https://api.stripe.com/v1/prices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(nickname, data.error?.message || data);
      process.exit(1);
    }
    return data.id;
  }

  const starter = await createPrice("Starter", 2900);
  const growth = await createPrice("Growth", 7900);
  const pro = await createPrice("Pro", 14900);
  console.log(JSON.stringify({ starter, growth, pro }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
