const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, ".env.vercel.prod");

execSync("npx vercel env pull .env.vercel.prod --environment production --yes", {
  cwd: root,
  stdio: "inherit",
});

function loadEnv(file) {
  const env = {};
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

async function createPrice(key, nickname, unitAmount) {
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
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
  return data.id;
}

(async () => {
  const env = loadEnv(out);
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("no prod STRIPE_SECRET_KEY");
  console.log("prod_key_mode", key.startsWith("sk_live") ? "live" : "test");
  const starter = await createPrice(key, "Starter", 2900);
  const growth = await createPrice(key, "Growth", 7900);
  const pro = await createPrice(key, "Pro", 14900);
  const ids = { starter, growth, pro };
  fs.writeFileSync(
    path.join(root, "scripts", "new-stripe-price-ids.json"),
    JSON.stringify(ids, null, 2)
  );
  console.log(JSON.stringify(ids, null, 2));
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
