/**
 * Call production founder-brief API (async + poll until ready).
 * node scripts/call-founder-brief.mjs
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
if (!secret || secret === "[SENSITIVE]") {
  console.error("ADMIN_STATS_SECRET missing in .env.local");
  process.exit(1);
}

const base = process.env.FOUNDER_BRIEF_BASE || "https://makeitrainapp.com";

const body = {
  url: process.argv[2] || "https://petvax.ai",
  productName: process.argv[3] || "PetVax",
  founderName: process.argv[4] || "Ali Nawaz",
  stage: "launched",
  price: "Free + ads; PetVax Plus (PDF export, scanning, more AI, fewer ads)",
  traction:
    "Founder-reported via outreach: free users exist; no paying customers yet. Wants a clearer first paid path.",
};

console.log("POST", base + "/api/admin/founder-brief");
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
  console.error("Failed", res.status, start);
  process.exit(1);
}
console.log("created", start.shareUrl, "status=", start.status);

const token = start.token;
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  const poll = await fetch(
    `${base}/api/admin/founder-brief?token=${encodeURIComponent(token)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  const json = await poll.json();
  console.log(`poll ${i + 1}:`, json.status);
  if (json.status === "ready" || json.status === "failed") {
    console.log(JSON.stringify(json, null, 2));
    writeFileSync(
      resolve(root, "tmp-founder-brief-last.json"),
      JSON.stringify(json, null, 2)
    );
    console.log("\nSHARE:", json.shareUrl);
    process.exit(json.status === "ready" ? 0 : 1);
  }
}
console.error("Timed out polling");
process.exit(1);
