/**
 * Generate a shareable Monetization Brief (+ Buyer Stress Test) for a founder URL.
 * Uses the same Grok jobs as the app, then inserts into shared_reports.
 *
 * Usage:
 *   node scripts/generate-founder-brief.mjs --url https://petvax.ai --name "Ali Nawaz" --product "PetVax"
 *
 * Loads env from .env.local then .env.vercel.prod (Grok often only in prod env file).
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(name) {
  const p = resolve(root, name);
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split(/\r?\n/)) {
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

loadEnvFile(".env.local");
loadEnvFile(".env.vercel.pull");
loadEnvFile(".env.vercel.prod");
loadEnvFile(".env.check");
// Scrubbed/placeholder model names in local copies of prod env
if (
  !process.env.GROK_MODEL ||
  /SENSITIVE|placeholder|changeme/i.test(process.env.GROK_MODEL)
) {
  process.env.GROK_MODEL = "grok-4.5";
}

function arg(flag, fallback = "") {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const productUrl = arg("--url", "https://petvax.ai");
const founderName = arg("--name", "Ali Nawaz");
const productName = arg("--product", "PetVax");
const traction = arg(
  "--traction",
  "Founder-reported: free users exist; no paying customers yet. Free tier with ads; PetVax Plus = PDF export, scanning, more AI, fewer ads."
);
const stage = arg("--stage", "launched");
const currentPrice = arg("--price", "Free + ads; PetVax Plus (paid)");
const ownerEmail = arg("--owner", "ai@reliableainetwork.com");

const IDEA_ANALYZER_SYSTEM_PROMPT = `You are RAIN Monetize's commercial analyst — writing an operator-grade monetization memo, not a motivational coach note. Think like a sharp GTM advisor who has seen SaaS, APIs, marketplaces, and B2B tools. Be specific to THEIR product and evidence. Short sentences. No hype without substance. If evidence is thin, say so and lower confidence.

Your job is not polished marketing. Force a hard commercial answer: one primary buyer, one pain valuable enough to pay for, one smallest paid offer, and clear evidence for what to test next (push harder or stop). Prefer an honest "wedge still unclear / positioning too broad" over a fake-precise positive plan.

Grade every material claim:
- observed = pulled from scraped URL, GitHub README, uploaded docs, or Apollo firmographics in the prompt
- founder_reported = from description, traction, checklist "yes", or named competitors they provided
- assumed = inference you are making without direct evidence

You MUST respond with a single JSON object matching exactly this schema:
{
  "score": <number from 1 to 10>,
  "score_reasoning": "<2-4 sentences>",
  "confidence": "<low | medium | high>",
  "commercial_answer": {
    "primary_buyer": "<one named buyer role>",
    "valuable_pain": "<specific pain>",
    "smallest_paid_offer": "<smallest paid yes>",
    "wedge_clarity": "<clear | narrowing | unclear>",
    "honesty_note": "<one sentence>",
    "why_this_path": "<why this path>",
    "what_would_disprove": "<falsifier>"
  },
  "assumptions": ["<assumption>"],
  "kill_criteria": ["<kill>"],
  "recommended_paths": [
    { "name": "<path>", "description": "<desc>", "effort": "low|medium|high", "revenue_potential": "low|medium|high" }
  ],
  "quick_wins": ["<win>"],
  "validation_plan": ["<step>"],
  "big_promise": "<promise in second person>",
  "citations": [
    { "claim": "<claim>", "source": "<source>", "grade": "observed|founder_reported|assumed" }
  ]
}

No em dashes. Return ONLY JSON.`;

const BUYER_STRESS_TEST_SYSTEM_PROMPT = `You are Make it RAIN's Buyer Stress Test — a hostile but fair commercial war-game.

Your job: put THIS product through hard buyer conversations BEFORE the founder burns outreach. Be blunt. Kill weak offers early. Praise only what would survive a real skeptical buyer.

You MUST return a single JSON object:
{
  "verdict": "<one of: survives | fragile | dies>",
  "verdict_line": "<one sentence the founder feels in their gut>",
  "survival_score": <integer 1-10>,
  "rounds": [
    {
      "buyer_name": "<short persona name>",
      "buyer_type": "<role / situation>",
      "opening_pushback": "<what they say first>",
      "founder_best_reply": "<best honest reply>",
      "buyer_follow_up": "<second punch>",
      "outcome": "<won_interest | stalled | killed>",
      "lesson": "<what this round proves>"
    }
  ],
  "fatal_objections": ["<objection>"],
  "offer_rewrite": {
    "smallest_paid_offer": "<clearer paid offer>",
    "who_may_pay": "<sharper primary buyer>",
    "one_line_pitch": "<pitch that survives pushback>"
  },
  "dm_opener_after_test": "<one DM opener ready to paste>",
  "do_not_message_until": ["<fix this first>"],
  "evidence_gaps": [
    { "claim": "<assumption>", "grade": "observed | founder-reported | assumed", "risk": "<why it kills outreach>" }
  ]
}

Exactly 5 rounds. Outcomes honest. No em dashes. Return ONLY JSON.`;

async function scrapeWebsite(url) {
  const withProto = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  let res = await fetch(withProto, {
    redirect: "follow",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "MakeItRAIN-AuditBot/1.0 (+https://makeitrainapp.com)",
    },
  });
  if (!res.ok) throw new Error(`Scrape failed: ${res.status}`);
  let html = (await res.text()).slice(0, 600_000);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim() || null;
  function metaContent(key) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)["']`,
        "i"
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${key}["']`,
        "i"
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]?.trim()) return m[1].trim();
    }
    return null;
  }
  const meta_description =
    metaContent("description") || metaContent("og:description");
  const og_title = metaContent("og:title");
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|br|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  let text_excerpt = text.slice(0, 8000);
  let finalTitle = og_title || title;
  let finalMeta = meta_description;
  let finalUrl = res.url || withProto;

  if (text_excerpt.length < 120) {
    try {
      const jina = await fetch(`https://r.jina.ai/${withProto}`, {
        headers: {
          Accept: "text/plain",
          "User-Agent": "MakeItRAIN-AuditBot/1.0 (+https://makeitrainapp.com)",
        },
      });
      if (jina.ok) {
        const body = (await jina.text()).trim();
        if (body.length > text_excerpt.length) {
          text_excerpt = body.slice(0, 8000);
          const tm = body.match(/^Title:\s*(.+)$/im);
          const dm = body.match(/^Description:\s*(.+)$/im);
          if (tm) finalTitle = tm[1].trim();
          if (dm) finalMeta = dm[1].trim();
        }
      }
    } catch {
      /* ignore */
    }
  }

  return {
    fetched_at: new Date().toISOString(),
    url: withProto,
    final_url: finalUrl,
    title: finalTitle,
    meta_description: finalMeta,
    og_title,
    text_excerpt,
    char_count: text_excerpt.length,
  };
}

async function grokChatJSON(messages) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY is not set");
  const model = process.env.GROK_MODEL || "grok-4.5";
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Grok ${res.status}: ${detail.slice(0, 400)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty Grok response");
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Grok response not JSON");
  }
}

function productBlock(product) {
  const w = product.website_context;
  return [
    `Title: ${product.title}`,
    `Type: ${product.type}`,
    `Stage: ${product.stage || "unknown"}`,
    `Current price: ${product.current_price || "not stated"}`,
    `Product URL: ${product.product_url}`,
    `Description:\n${product.description}`,
    `Traction:\n${product.traction}`,
    w
      ? `URL scrape (${w.fetched_at.slice(0, 10)} from ${w.final_url}):\nTitle: ${w.title || ""}\nMeta: ${w.meta_description || ""}\nExcerpt:\n"""\n${w.text_excerpt}\n"""`
      : "URL scrape: none",
  ].join("\n\n");
}

async function resolveOwnerId(admin) {
  if (process.env.FOUNDER_USER_ID) return process.env.FOUNDER_USER_ID;
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", ownerEmail)
    .limit(1);
  if (profiles?.[0]?.id) return profiles[0].id;
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const hit = list?.users?.find(
    (u) => (u.email || "").toLowerCase() === ownerEmail.toLowerCase()
  );
  if (hit?.id) return hit.id;
  const anyAdmin = list?.users?.find((u) =>
    /reliableainetwork|makeitrain/i.test(u.email || "")
  );
  if (anyAdmin?.id) {
    console.warn(`Owner email miss; using ${anyAdmin.email}`);
    return anyAdmin.id;
  }
  throw new Error(`Could not resolve owner user for ${ownerEmail}`);
}

async function main() {
  console.log(`Scraping ${productUrl}...`);
  const website = await scrapeWebsite(productUrl);
  console.log(
    `Scraped ${website.char_count} chars · title: ${website.title || "(none)"}`
  );

  const description = [
    website.meta_description || "",
    website.text_excerpt.slice(0, 2500),
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 4000);

  const product = {
    title: productName,
    description:
      description ||
      `${productName} — pet vaccine / health app. Free with ads; Plus unlocks PDF and scanning.`,
    type: "saas",
    stage,
    traction,
    current_price: currentPrice,
    product_url: productUrl,
    website_context: website,
  };

  const cover_note = `Prepared for ${founderName} · First Customer Path on ${productName}. Free users exist; paying customers do not. This brief picks who to test first, what paid wedge to offer, and runs a Buyer Stress Test before outreach.`;

  console.log("Running Idea Analyzer...");
  const analysis = await grokChatJSON([
    { role: "system", content: IDEA_ANALYZER_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Write a commercial opportunity memo for this product.\n\nForce a hard commercial answer (one buyer, valuable pain, smallest paid offer).\n\n${productBlock(product)}\n\nRespond with ONLY the JSON object.`,
    },
  ]);
  console.log(
    `Analyzer score ${analysis.score}/10 · wedge ${analysis.commercial_answer?.wedge_clarity}`
  );

  console.log("Running Buyer Stress Test...");
  const stressRaw = await grokChatJSON([
    { role: "system", content: BUYER_STRESS_TEST_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Run a Buyer Stress Test on this product:\n\n${productBlock(product)}\n\nAudience hint: pet parents who need vaccine records for boarding, daycare, travel, or multi-pet households.\nPrice hint: ${currentPrice}\nBig promise from analyzer: ${analysis.big_promise || ""}\n\nONLY JSON.`,
    },
  ]);

  const verdict = String(stressRaw.verdict ?? "fragile").toLowerCase();
  const stress_test = {
    verdict: ["survives", "fragile", "dies"].includes(verdict)
      ? verdict
      : "fragile",
    verdict_line: String(stressRaw.verdict_line ?? "").trim(),
    survival_score: Math.min(
      10,
      Math.max(1, Number(stressRaw.survival_score) || 5)
    ),
    rounds: Array.isArray(stressRaw.rounds) ? stressRaw.rounds.slice(0, 5) : [],
    fatal_objections: Array.isArray(stressRaw.fatal_objections)
      ? stressRaw.fatal_objections.map(String)
      : [],
    offer_rewrite: {
      smallest_paid_offer: String(
        stressRaw.offer_rewrite?.smallest_paid_offer ?? ""
      ).trim(),
      who_may_pay: String(stressRaw.offer_rewrite?.who_may_pay ?? "").trim(),
      one_line_pitch: String(stressRaw.offer_rewrite?.one_line_pitch ?? "").trim(),
    },
    dm_opener_after_test: String(stressRaw.dm_opener_after_test ?? "").trim(),
    do_not_message_until: Array.isArray(stressRaw.do_not_message_until)
      ? stressRaw.do_not_message_until.map(String)
      : [],
    evidence_gaps: Array.isArray(stressRaw.evidence_gaps)
      ? stressRaw.evidence_gaps
      : [],
  };
  console.log(
    `Stress: ${stress_test.verdict} · ${stress_test.survival_score}/10`
  );

  const payload = {
    version: 2,
    generated_at: new Date().toISOString(),
    product,
    analysis,
    pricing: null,
    stress_test,
    cover_note,
    evidence_sources: [
      "Product URL scrape (observed)",
      "Founder-reported traction (via outreach)",
      "Public pricing / Plus claims on site",
    ],
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing Supabase admin env");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const userId = await resolveOwnerId(admin);
  const token = randomBytes(18).toString("hex");
  const title = `First Customer Path — ${productName} (for ${founderName})`;

  const { data, error } = await admin
    .from("shared_reports")
    .insert({
      user_id: userId,
      token,
      title,
      payload,
    })
    .select("id, token, created_at")
    .single();

  if (error) {
    console.error(error);
    throw new Error(`Insert failed: ${error.message}`);
  }

  const shareUrl = `https://makeitrainapp.com/r/${data.token}`;
  console.log("\n=== SHARE URL ===");
  console.log(shareUrl);
  console.log("Print / PDF available on the page.\n");

  // Write local snapshot for DM drafting
  const outPath = resolve(root, "tmp-founder-brief-last.json");
  const { writeFileSync } = await import("fs");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        shareUrl,
        token: data.token,
        analysis_summary: {
          score: analysis.score,
          buyer: analysis.commercial_answer?.primary_buyer,
          offer: analysis.commercial_answer?.smallest_paid_offer,
          big_promise: analysis.big_promise,
        },
        stress_summary: {
          verdict: stress_test.verdict,
          survival_score: stress_test.survival_score,
          verdict_line: stress_test.verdict_line,
          who_may_pay: stress_test.offer_rewrite.who_may_pay,
          smallest_paid_offer: stress_test.offer_rewrite.smallest_paid_offer,
          dm_opener: stress_test.dm_opener_after_test,
        },
      },
      null,
      2
    )
  );
  console.log(`Snapshot: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
