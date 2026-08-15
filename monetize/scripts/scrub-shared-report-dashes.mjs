/**
 * Scrub em/en dashes from an existing shared_reports row.
 * node scripts/scrub-shared-report-dashes.mjs <token>
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

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

function scrub(value) {
  if (typeof value === "string") {
    return value
      .replace(/\u2014/g, " - ")
      .replace(/\u2013/g, "-")
      .replace(/ {2,}/g, " ")
      .trim();
  }
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = scrub(v);
    return out;
  }
  return value;
}

const token = process.argv[2];
if (!token) {
  console.error("Usage: node scripts/scrub-shared-report-dashes.mjs <token>");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await admin
  .from("shared_reports")
  .select("id, title, payload")
  .eq("token", token)
  .single();

if (error || !data) {
  console.error(error || "not found");
  process.exit(1);
}

const title = scrub(data.title);
const payload = scrub(data.payload);
const { error: upErr } = await admin
  .from("shared_reports")
  .update({ title, payload })
  .eq("id", data.id);

if (upErr) {
  console.error(upErr);
  process.exit(1);
}
console.log("scrubbed", token, title);
