const fs = require("fs");
const path = require("path");

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[m[1].trim()] = v;
  }
  return env;
}

async function getPrice(key, id) {
  const res = await fetch(`https://api.stripe.com/v1/prices/${id}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await res.json();
  return {
    ok: res.ok,
    amount: data.unit_amount,
    nickname: data.nickname,
    err: data.error?.message,
  };
}

(async () => {
  const root = path.join(__dirname, "..");
  const local = { ...loadEnv(path.join(root, ".env.check")), ...loadEnv(path.join(root, ".env.local")) };
  const prod = loadEnv(path.join(root, ".env.vercel.prod"));
  const created = {
    starter: "price_1Tymt433XWkeZRO7wQXC1IgA",
    growth: "price_1Tymt433XWkeZRO7opXsiZtO",
    pro: "price_1Tymt433XWkeZRO7PfOih3so",
  };
  fs.writeFileSync(
    path.join(root, "scripts", "new-stripe-price-ids.json"),
    JSON.stringify(created, null, 2)
  );

  for (const [label, key] of [
    ["local", local.STRIPE_SECRET_KEY],
    ["prod_file", prod.STRIPE_SECRET_KEY],
  ]) {
    if (!key) {
      console.log(label, "missing key");
      continue;
    }
    console.log(label, "mode", key.startsWith("sk_live") ? "live" : "test");
    const old = local.STRIPE_PRICE_STARTER;
    console.log(label, "old_starter", await getPrice(key, old));
    console.log(label, "new_starter", await getPrice(key, created.starter));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
