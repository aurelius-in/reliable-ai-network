/** Fill [BRACKET] placeholders from product + buyers + pricing for Library / Premium. */

import type {
  BuyerProfilesResult,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";

export type TemplateFillInput = {
  title: string;
  description: string;
  type?: string;
  current_price?: string | null;
  big_promise?: string | null;
  audience?: string | null;
  pain?: string | null;
  outcome?: string | null;
  positioning?: string | null;
  objection?: string | null;
  objection_answer?: string | null;
  sweet_spot?: string | null;
  value_anchor?: string | null;
  cta?: string | null;
  timeframe?: string | null;
};

export function buildTemplateFillInput(args: {
  title: string;
  description: string;
  type?: string;
  current_price?: string | null;
  analysis?: IdeaAnalysis | null;
  buyers?: BuyerProfilesResult | null;
  pricing?: PricingRecommendation | null;
}): TemplateFillInput {
  const persona = args.buyers?.personas?.[0];
  const sweet =
    args.pricing?.price_ranges?.[0]?.sweet_spot ??
    args.pricing?.price_ranges?.find((r) => r.sweet_spot)?.sweet_spot;
  const price =
    sweet != null
      ? String(sweet)
      : args.current_price?.replace(/^\$/, "") || null;

  return {
    title: args.title,
    description: args.description,
    type: args.type,
    current_price: price,
    big_promise: args.analysis?.big_promise ?? null,
    audience:
      args.buyers?.best_first_target ||
      persona?.who ||
      null,
    pain: persona?.pain_points?.[0] ?? null,
    outcome: persona?.desires?.[0] ?? args.analysis?.big_promise ?? null,
    positioning: persona?.positioning_line ?? null,
    objection: persona?.objections?.[0]?.objection ?? null,
    objection_answer: persona?.objections?.[0]?.answer ?? null,
    sweet_spot: price,
    value_anchor: args.pricing?.value_anchors?.[0] ?? null,
    cta: args.pricing?.sales_copy?.cta ?? null,
    timeframe: "30 days",
  };
}

export function fillTemplatePlaceholders(
  content: string,
  product: TemplateFillInput
): string {
  const title = product.title.trim() || "[PRODUCT NAME]";
  const desc = product.description.trim();
  const promise =
    product.big_promise?.trim() ||
    product.outcome?.trim() ||
    (desc ? desc.split(/[.!?]/)[0]?.trim().slice(0, 120) : "") ||
    "[BIG PROMISE IN ONE LINE]";
  const price =
    product.sweet_spot?.trim() ||
    product.current_price?.replace(/^\$/, "").trim() ||
    "[PRICE]";
  const category = product.type?.trim() || "B2B SaaS";
  const audience = product.audience?.trim() || "B2B SaaS buyers";
  const pain =
    product.pain?.trim() ||
    "wasting months on features that never convert";
  const outcome = product.outcome?.trim() || promise;
  const positioning =
    product.positioning?.trim() ||
    `${title} helps ${audience} get ${outcome}`;
  const objection =
    product.objection?.trim() ||
    "We can build this ourselves";
  const objectionAnswer =
    product.objection_answer?.trim() ||
    `Building it in-house costs months you could spend closing. ${title} gets you a first paid path this week.`;
  const valueAnchor =
    product.value_anchor?.trim() ||
    "one hour of senior engineer time";
  const cta = product.cta?.trim() || "Book a 15-minute walkthrough";
  const timeframe = product.timeframe?.trim() || "30 days";
  const firstWin =
    desc.split(/[.!?]/)[0]?.trim().slice(0, 100) ||
    `complete the first setup for ${title}`;

  const map: Record<string, string> = {
    "[PRODUCT NAME]": title,
    "[BIG PROMISE IN ONE LINE]": promise,
    "[BIG PROMISE — outcome + timeframe + without pain]": `${outcome} in ${timeframe} without ${pain}`,
    "[PRICE]": price,
    "[CATEGORY]": category,
    "[AUDIENCE]": audience,
    "[OUTCOME]": outcome,
    "[DESIRED OUTCOME]": outcome,
    "[PAINFUL PROBLEM]": pain,
    "[PAIN 1 in their words]": pain,
    "[PAIN 2 in their words]":
      product.pain?.trim() || "guessing what buyers will pay for",
    "[PAIN 3 in their words]": "shipping without a path to first dollar",
    "[THING THEY HATE]": pain,
    "[TIMEFRAME]": timeframe,
    "[X days]": timeframe,
    "[YOUR NAME]": "[YOUR NAME]",
    "[FIRST NAME]": "[FIRST NAME]",
    "[CORE DELIVERABLE]": promise,
    "[why it matters in one sentence]": positioning,
    "[BONUS 1]": "First-dollar outreach pack",
    "[BONUS 2]": "Objection-handling scripts",
    "[X]": price,
    "[SPECIFIC RESULT]": outcome,
    "[VALUE ANCHOR, e.g. \"one takeout dinner\"]": valueAnchor,
    "[OUTCOME THAT LASTS]": outcome,
    "[SMALLEST HIGH-IMPACT ACTION]": firstWin,
    "[TEASE EMAIL 2]": `how ${audience} close the first deal with ${title}`,
    "[GOAL]": outcome,
    "[COMMON MISTAKE]": "polish the product before talking to buyers",
    "[YOUR APPROACH IN 2-3 SENTENCES]": positioning,
    "[FEATURE]": "first-dollar path",
    "[FEATURE THAT SOLVES IT]": "buyer-ready ask + pricing economics",
    "[LINK]": "[LINK]",
    "[NAME/PERSONA]": audience.split(/[,.]/)[0]?.trim() || "a founder like you",
    "[RESULT]": outcome,
    "[SHORT CASE STUDY OR STORY — before, what they did, after. 4-6 sentences.]":
      `Before: ${audience} were stuck on ${pain}. They ran ${title}, locked a price, and sent the first ask. After: a clearer path to ${outcome}.`,
    "[BIGGEST OBJECTION]": objection,
    "[OBJECTION]": objection,
    "[REFRAME + EVIDENCE]": objectionAnswer,
    "[RECAP OF VALUE SO FAR]": promise,
    "[PAID OFFER / UPGRADE]": `${title} at $${price}`,
    "[BENEFIT 1]": outcome,
    "[BENEFIT 2]": `A clear ask for ${audience}`,
    "[BENEFIT 3]": `Pricing you can defend vs ${valueAnchor}`,
    "[CTA BUTTON TEXT]": cta,
    "[ACTION-ORIENTED TEXT, e.g. \"Start free — get my plan\"]": cta,
    "[Who it's for + the mechanism that makes it believable]":
      `For ${audience}. ${positioning}`,
    "[CORE]": title,
    "[1 line]": promise,
    "[NAME] Method": `${title.split(/\s+/)[0] || "RAIN"} Method`,
  };

  let out = content;
  for (const [key, value] of Object.entries(map)) {
    out = out.split(key).join(value);
  }

  if (desc && out.includes("[1-2 sentences of proof")) {
    out = out.replace(
      /\[1-2 sentences of proof[^\]]*\]/g,
      desc.slice(0, 280)
    );
  }
  if (desc && out.includes("[Who it's for + the mechanism")) {
    out = out.replace(
      "[Who it's for + the mechanism that makes it believable]",
      `For ${audience}. ${positioning}`
    );
  }

  // Soft-fill remaining simple [WORD] tokens that look like single placeholders
  out = out.replace(
    /\[([A-Z][A-Z0-9 /,'"\-?]{2,60})\]/g,
    (full, inner: string) => {
      const key = inner.toUpperCase();
      if (key.includes("NAME") && key.includes("YOUR")) return "[YOUR NAME]";
      if (key.includes("LINK")) return "[LINK]";
      if (key.includes("PAIN")) return pain;
      if (key.includes("OUTCOME") || key.includes("RESULT")) return outcome;
      if (key.includes("AUDIENCE") || key.includes("BUYER")) return audience;
      if (key.includes("PRICE") || key === "X") return price;
      if (key.includes("CTA") || key.includes("BUTTON")) return cta;
      if (key.includes("OBJECTION")) return objection;
      if (key.includes("PROMISE")) return promise;
      if (key.includes("TIME") || key.includes("DAY")) return timeframe;
      return full;
    }
  );

  return out;
}
