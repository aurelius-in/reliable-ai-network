/**
 * Replace public example briefs with scrubbed clones of the production client briefs.
 * Keeps commercial sophistication; redacts founder/company/URL identifiers only.
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REDACT = "████████";

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

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).trim();
const serviceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  ""
).trim();

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or service role key");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXAMPLES = [
  {
    id: "A",
    sourceToken: "a4920a00dfc9dee53c51fe4a7d2e0e06fb9d",
    // overwrite existing public token so homepage links stay valid
    targetToken: "3e8c70e39bd350961d9c0a88e7182e9b323f",
    category: "Pet health / records SaaS",
    scrub: [
      /PetVax\s*AI/gi,
      /PetVax/gi,
      /petvax\.ai/gi,
      /https?:\/\/(www\.)?petvax\.ai\/?/gi,
      /Ali\s+Nawaz/gi,
      /\bNawaz\b/gi,
      // careful: don't wipe common words; only standalone Ali as name
      /\bAli\b(?=\s|,|\.|'|\"|\)|$)/g,
    ],
  },
  {
    id: "C",
    sourceToken: "facfff0e0ef989262c9648e5cc1d06c7a6a9",
    targetToken: "b464a9702a86973e5c304f99fa208ab5956e",
    category: "AI content ops SaaS",
    scrub: [
      /Contentsaurus/gi,
      /contentsaurus\.com/gi,
      /https?:\/\/(www\.)?contentsaurus\.com\/?/gi,
      /Mirza\s+Muhammad\s+Ahmed/gi,
      /Mirza\s+Ahmed/gi,
      /Muhammad\s+Ahmed/gi,
      /\bMirza\b/g,
    ],
  },
];

function scrubValue(value, patterns) {
  if (typeof value === "string") {
    let out = value;
    for (const re of patterns) out = out.replace(re, REDACT);
    return out;
  }
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, patterns));
  if (value && typeof value === "object") {
    const next = {};
    for (const [k, v] of Object.entries(value)) {
      next[k] = scrubValue(v, patterns);
    }
    return next;
  }
  return value;
}

function hardenIdentifiers(payload) {
  if (!payload || typeof payload !== "object") return payload;
  if (payload.product) {
    payload.product.title = REDACT;
    if (payload.product.product_url) payload.product.product_url = REDACT;
    const wc = payload.product.website_context;
    if (wc && typeof wc === "object") {
      if (wc.title) wc.title = REDACT;
      if (wc.final_url) wc.final_url = REDACT;
      if (wc.url) wc.url = REDACT;
      if (wc.canonical_url) wc.canonical_url = REDACT;
    }
  }
  if (payload.founder_name) payload.founder_name = REDACT;
  if (payload.founderName) payload.founderName = REDACT;
  return payload;
}

function remainingLeaks(text, patterns) {
  const leaks = [];
  for (const re of patterns) {
    try {
      // Always rebuild with only i + g to avoid duplicate flag errors
      const probe = new RegExp(re.source, "gi");
      const m = text.match(probe);
      if (m) leaks.push(...m.slice(0, 5));
    } catch {
      // skip
    }
  }
  return [...new Set(leaks)];
}

const results = [];
for (const ex of EXAMPLES) {
  console.log(`\n[${ex.id}] cloning ${ex.sourceToken} → ${ex.targetToken}`);
  const { data: src, error: srcErr } = await admin
    .from("shared_reports")
    .select("payload, title, user_id")
    .eq("token", ex.sourceToken)
    .maybeSingle();
  if (srcErr || !src) throw new Error(`[${ex.id}] source load: ${srcErr?.message || "missing"}`);

  let payload = scrubValue(structuredClone(src.payload), ex.scrub);
  payload = hardenIdentifiers(payload);

  // Public sample framing without weakening the brief body
  payload.cover_note = `Sample First Customer Path brief (names redacted). Same Analyzer + Buyer Stress Test + Full Brief format we deliver privately. Category: ${ex.category}.`;
  payload.example_id = ex.id;
  payload.anonymized = true;
  payload.anonymized_from_quality = "production_client_clone";

  const title = `First Customer Path: ${REDACT} (for ${REDACT})`;
  const blob = JSON.stringify(payload) + title;
  const leaks = remainingLeaks(blob, ex.scrub);
  if (leaks.length) {
    console.warn(`[${ex.id}] residual matches (review):`, leaks);
  }

  const { data: existing, error: exErr } = await admin
    .from("shared_reports")
    .select("id")
    .eq("token", ex.targetToken)
    .maybeSingle();
  if (exErr) throw new Error(`[${ex.id}] target check: ${exErr.message}`);

  if (existing) {
    const { error: upErr } = await admin
      .from("shared_reports")
      .update({
        title,
        payload,
      })
      .eq("token", ex.targetToken);
    if (upErr) throw new Error(`[${ex.id}] update: ${upErr.message}`);
    console.log(`[${ex.id}] updated existing public token`);
  } else {
    const { error: insErr } = await admin.from("shared_reports").insert({
      token: ex.targetToken,
      title,
      payload,
      user_id: src.user_id,
    });
    if (insErr) throw new Error(`[${ex.id}] insert: ${insErr.message}`);
    console.log(`[${ex.id}] inserted new public token`);
  }

  results.push({
    id: ex.id,
    token: ex.targetToken,
    shareUrl: `https://makeitrainapp.com/r/${ex.targetToken}`,
    payloadBytes: JSON.stringify(payload).length,
    score: payload.analysis?.score,
    stress: payload.stress_test?.verdict,
    survival: payload.stress_test?.survival_score,
    extrasKeys: payload.extras ? Object.keys(payload.extras) : [],
    leaks,
  });
}

const out = {
  upgraded_at: new Date().toISOString(),
  method: "clone_production_briefs_then_scrub_identifiers",
  examples: results,
};
writeFileSync(resolve(root, "tmp-upgraded-public-briefs.json"), JSON.stringify(out, null, 2));
console.log("\nDONE");
console.log(JSON.stringify(out, null, 2));
