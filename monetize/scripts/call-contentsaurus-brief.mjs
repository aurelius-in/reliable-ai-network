/**
 * One-shot Founder Brief: Contentsaurus / Mirza
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv(name) {
  const p = resolve(root, name);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(".env.local");

const secret = process.env.ADMIN_STATS_SECRET?.trim();
if (!secret) {
  console.error("ADMIN_STATS_SECRET missing");
  process.exit(1);
}

const base = "https://makeitrainapp.com";

const body = {
  url: "https://contentsaurus.com/",
  productName: "Contentsaurus",
  founderName: "Mirza Muhammad Ahmed",
  stage: "launched",
  // Do not invent $3/$5; let scrape establish packaging.
  price: "See live site packaging (do not invent a sticker price)",
  traction:
    "Live product. Customer count, revenue, and paid conversion not verified in this run. Founder cares about downstream business impact (convert, rank, qualified interest, return because of value), not output volume/speed/cost alone.",
  audience:
    "Startups, marketers, and businesses that need publish-ready content and care about measurable downstream business impact. Commercial question to stress: why pay Contentsaurus repeatedly instead of ChatGPT/Claude or another generator, and can it credibly connect output to a downstream result worth paying for? Watch for vulnerability from positioning breadth (startups, marketers, businesses, students, creators).",
  coverNote:
    "Prepared for Mirza Muhammad Ahmed. First Customer Path on Contentsaurus. Focus: who may pay for downstream content impact, smallest paid offer to test, and where the offer is still vulnerable vs free AI generators.",
};

console.log("POST founder-brief Contentsaurus…");
const res = await fetch(base + "/api/admin/founder-brief", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify(body),
});
const start = await res.json();
if (!res.ok) {
  console.error(res.status, start);
  process.exit(1);
}
console.log("created", start.shareUrl, start.status);

const token = start.token;
for (let i = 0; i < 75; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const poll = await fetch(
    `${base}/api/admin/founder-brief?token=${encodeURIComponent(token)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  const json = await poll.json();
  console.log(`poll ${i + 1}:`, json.status);
  if (json.status === "ready" || json.status === "failed") {
    writeFileSync(
      resolve(root, "tmp-founder-brief-last.json"),
      JSON.stringify(json, null, 2)
    );
    console.log(JSON.stringify(json, null, 2));
    process.exit(json.status === "ready" ? 0 : 1);
  }
}
console.error("timeout");
process.exit(1);
