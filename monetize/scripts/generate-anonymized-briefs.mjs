/**
 * Generate anonymized shareable Founder Brief examples.
 *
 * Prefer: node scripts/upgrade-public-briefs-from-originals.mjs
 * That clones production client briefs (full quality) then scrubs identifiers.
 *
 * This script regenerates from URLs with redacted names in the prompt, which
 * produces thinner analysis. Keep only for cold samples when no strong original exists.
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

const secret = process.env.ADMIN_STATS_SECRET?.trim();
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

if (!secret || !supabaseUrl || !serviceKey) {
  console.error("Missing ADMIN_STATS_SECRET, Supabase URL, or service role key");
  process.exit(1);
}

const base = "https://makeitrainapp.com";
const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXAMPLES = [
  {
    id: "A",
    url: "https://petvax.ai/",
    scrub: [
      /PetVax\s*AI/gi,
      /PetVax/gi,
      /petvax\.ai/gi,
      /https?:\/\/(www\.)?petvax\.ai\/?/gi,
      /Ali\s+Nawaz/gi,
      /\bAli\b/g,
    ],
    body: {
      url: "https://petvax.ai/",
      productName: REDACT,
      founderName: REDACT,
      stage: "launched",
      price: "Free to start; paid tier for PDF export and scanning (from live site)",
      traction:
        "Live product. Free users reported; paying customers not verified in this run.",
      audience:
        "Pet owners who board, use daycare, travel, or hire sitters and need vaccine proof on short notice.",
      coverNote: `Sample First Customer Path brief (anonymized). Founder: ${REDACT}. Product: ${REDACT}. Focus: who may pay, smallest paid offer, and where the offer is still vulnerable.`,
    },
  },
  {
    id: "C",
    url: "https://contentsaurus.com/",
    scrub: [
      /Contentsaurus/gi,
      /contentsaurus\.com/gi,
      /https?:\/\/(www\.)?contentsaurus\.com\/?/gi,
      /Mirza\s+Muhammad\s+Ahmed/gi,
      /Mirza\s+Ahmed/gi,
      /\bMirza\b/g,
    ],
    body: {
      url: "https://contentsaurus.com/",
      productName: REDACT,
      founderName: REDACT,
      stage: "launched",
      price: "See live site packaging (do not invent a sticker price)",
      traction:
        "Live product. Customer count, revenue, and paid conversion not verified in this run. Founder cares about downstream business impact, not output volume alone.",
      audience:
        "Startups, marketers, and businesses that need publish-ready content and care about measurable downstream business impact.",
      coverNote: `Sample First Customer Path brief (anonymized). Founder: ${REDACT}. Product: ${REDACT}. Focus: who may pay, smallest paid offer, and vulnerability vs free AI generators.`,
    },
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

async function createAndWait(example) {
  console.log(`\n[${example.id}] POST founder-brief…`);
  const res = await fetch(base + "/api/admin/founder-brief", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(example.body),
  });
  const start = await res.json();
  if (!res.ok) throw new Error(`${example.id} create failed: ${JSON.stringify(start)}`);
  console.log(`[${example.id}] created`, start.shareUrl, start.status);

  const token = start.token;
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const poll = await fetch(
      `${base}/api/admin/founder-brief?token=${encodeURIComponent(token)}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    const json = await poll.json();
    if (i % 5 === 0 || json.status !== "generating") {
      console.log(`[${example.id}] poll ${i + 1}:`, json.status);
    }
    if (json.status === "ready") return { token, shareUrl: json.shareUrl || start.shareUrl };
    if (json.status === "failed") {
      throw new Error(`[${example.id}] failed: ${json.error || "unknown"}`);
    }
  }
  throw new Error(`[${example.id}] timeout`);
}

async function anonymizeStored(token, patterns, exampleId) {
  const { data, error } = await admin
    .from("shared_reports")
    .select("id, title, payload")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) throw new Error(`[${exampleId}] load failed: ${error?.message}`);

  const payload = scrubValue(data.payload, patterns);
  if (payload?.product) {
    payload.product.title = REDACT;
    if (payload.product.product_url) payload.product.product_url = REDACT;
    if (payload.product.website_context) {
      payload.product.website_context = scrubValue(
        payload.product.website_context,
        patterns
      );
      if (payload.product.website_context.title)
        payload.product.website_context.title = REDACT;
      if (payload.product.website_context.final_url)
        payload.product.website_context.final_url = REDACT;
      if (payload.product.website_context.url)
        payload.product.website_context.url = REDACT;
    }
  }
  if (payload?.product_blurb) {
    payload.product_blurb = scrubValue(payload.product_blurb, patterns);
  }
  if (payload?.cover_note) {
    payload.cover_note = scrubValue(payload.cover_note, patterns);
  }

  const title = `First Customer Path: ${REDACT} (for ${REDACT})`;
  const { error: upErr } = await admin
    .from("shared_reports")
    .update({ title, payload })
    .eq("token", token);
  if (upErr) throw new Error(`[${exampleId}] update failed: ${upErr.message}`);
  console.log(`[${exampleId}] scrubbed + retitled`);
}

const results = [];
for (const example of EXAMPLES) {
  const { token, shareUrl } = await createAndWait(example);
  await anonymizeStored(token, example.scrub, example.id);
  results.push({
    id: example.id,
    shareUrl: String(shareUrl).replace(/MakeItRainApp\.com/i, "makeitrainapp.com"),
    token,
  });
}

const out = {
  generated_at: new Date().toISOString(),
  note: "Anonymized sample briefs for public sharing. Founder + company names replaced with ████████.",
  examples: results,
};
writeFileSync(
  resolve(root, "tmp-anonymized-briefs.json"),
  JSON.stringify(out, null, 2)
);
console.log("\nDONE");
console.log(JSON.stringify(out, null, 2));
