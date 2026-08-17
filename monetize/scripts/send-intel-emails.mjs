/**
 * Send early-founder intel emails (or dry-run).
 *
 *   node scripts/send-intel-emails.mjs --dry-run
 *   node scripts/send-intel-emails.mjs
 *   node scripts/send-intel-emails.mjs --person clive
 *
 * Uses production after deploy so survey URLs exist.
 * Local Resend keys from .env.local; posts to /api/admin/intel-email.
 */
import { readFileSync, existsSync } from "fs";
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
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(".env.local");

const secret = process.env.ADMIN_STATS_SECRET?.trim();
if (!secret || secret === "[SENSITIVE]") {
  console.error("ADMIN_STATS_SECRET missing in .env.local");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const personIdx = args.indexOf("--person");
const personId =
  personIdx >= 0 && args[personIdx + 1] ? args[personIdx + 1] : undefined;
const base = (
  process.env.INTEL_EMAIL_BASE ||
  process.env.FOUNDER_BRIEF_BASE ||
  "https://makeitrainapp.com"
).replace(/\/$/, "");

const body = { dryRun, ...(personId ? { personId } : {}) };
console.log("POST", base + "/api/admin/intel-email", body);

const res = await fetch(base + "/api/admin/intel-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify(body),
});
const data = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Failed", res.status, data);
  process.exit(1);
}
console.log(JSON.stringify(data, null, 2));
