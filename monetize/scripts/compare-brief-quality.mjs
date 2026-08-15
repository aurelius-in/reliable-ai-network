import { createClient } from "@supabase/supabase-js";
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

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const tokens = {
  petvax_original: "a4920a00dfc9dee53c51fe4a7d2e0e06fb9d",
  petvax_anon: "3e8c70e39bd350961d9c0a88e7182e9b323f",
  content_original: "facfff0e0ef989262c9648e5cc1d06c7a6a9",
  content_anon: "b464a9702a86973e5c304f99fa208ab5956e",
};

function summary(label, payload, title) {
  const p = payload || {};
  return {
    label,
    title,
    status: p.status,
    hasAnalysis: !!p.analysis,
    hasStress: !!p.stress_test,
    hasExtras: !!p.extras,
    hasPricing: !!p.pricing,
    hasCover: !!p.cover_note,
    hasBlurb: !!p.product_blurb,
    score: p.analysis?.score,
    stress: p.stress_test?.verdict,
    survival: p.stress_test?.survival_score,
    extrasKeys: p.extras ? Object.keys(p.extras) : [],
    execSummaryLen: p.extras?.executive_summary?.length || 0,
    rounds: p.stress_test?.rounds?.length || 0,
    productTitle: p.product?.title,
    payloadBytes: JSON.stringify(p).length,
  };
}

const out = {};
for (const [label, token] of Object.entries(tokens)) {
  const { data, error } = await admin
    .from("shared_reports")
    .select("title, payload")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) {
    out[label] = { error: error?.message || "missing" };
    continue;
  }
  out[label] = summary(label, data.payload, data.title);
}

writeFileSync(
  resolve(root, "tmp-brief-quality-compare.json"),
  JSON.stringify(out, null, 2)
);
console.log(JSON.stringify(out, null, 2));
