import type { IntentLevel, TrustPathKind } from "@/lib/demand-discovery/types";
import type { ProductContext } from "@/lib/product-context";

const HIGH = [
  "looking for",
  "recommend",
  "alternative to",
  "anyone use",
  "what tool",
  "how do i get",
  "first paying",
  "first customer",
  "no customers",
  "0 mrr",
  "$0",
  "zero paying",
  "can't get users",
  "willing to pay",
  "budget for",
];

const MED = [
  "frustrated",
  "struggling",
  "hate",
  "tired of",
  "manual",
  "spreadsheet",
  "doesn't work",
  "not working",
  "churn",
  "pricing",
];

/** Phrases that imply a timely reason to reach out now. */
const TRIGGER = [
  "just launched",
  "just shipped",
  "this week",
  "hiring",
  "raising",
  "migrating",
  "switching from",
  "switching to",
  "churning",
  "deadline",
  "urgent",
  "asap",
  "right now",
  "need help",
  "looking for a",
  "recommendations?",
  "what should i use",
  "replaced",
  "quit using",
];

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "your",
  "you",
  "our",
  "is",
  "are",
  "be",
  "this",
  "that",
  "it",
  "as",
  "at",
  "by",
  "from",
  "we",
  "i",
  "my",
  "app",
  "tool",
  "platform",
  "software",
  "saas",
  "ai",
  "help",
  "get",
  "use",
  "using",
  "make",
  "build",
  "built",
]);

export function scoreIntent(
  title: string,
  snippet: string
): { intent: IntentLevel; why: string } {
  const text = `${title} ${snippet}`.toLowerCase();
  const highHits = HIGH.filter((p) => text.includes(p));
  const medHits = MED.filter((p) => text.includes(p));

  if (highHits.length >= 1) {
    return {
      intent: "high",
      why: `Purchase / help-seeking language: ${highHits.slice(0, 3).join(", ")}`,
    };
  }
  if (medHits.length >= 2) {
    return {
      intent: "medium",
      why: `Pain language: ${medHits.slice(0, 3).join(", ")}`,
    };
  }
  if (medHits.length === 1) {
    return {
      intent: "medium",
      why: `Possible pain: ${medHits[0]}`,
    };
  }
  return {
    intent: "low",
    why: "Topical match only. Verify before outreach.",
  };
}

export function draftOutreach(opts: {
  productTitle: string;
  threadTitle: string;
}): string {
  const short = opts.productTitle.slice(0, 60);
  return (
    `Saw your thread "${opts.threadTitle.slice(0, 80)}". ` +
    `I built ${short} for a closely related problem. ` +
    `Happy to share a short walkthrough or a free look if useful. ` +
    `No hard pitch. If this isn't relevant, ignore.`
  );
}

function productTokens(product: ProductContext): string[] {
  const raw = `${product.title} ${product.description} ${product.type ?? ""}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ");
  const parts = raw.split(/\s+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return [...new Set(parts)].slice(0, 24);
}

function scoreFit(
  product: ProductContext,
  title: string,
  snippet: string
): { score: number; why: string } {
  const tokens = productTokens(product);
  const text = `${title} ${snippet}`.toLowerCase();
  const hits = tokens.filter((t) => text.includes(t));
  if (hits.length === 0) {
    return {
      score: 4,
      why: `Weak product fit for ${product.title}. Treat as topical only.`,
    };
  }
  const score = Math.min(25, 8 + hits.length * 4);
  return {
    score,
    why: `Fits ${product.title} via: ${hits.slice(0, 4).join(", ")}`,
  };
}

function scoreTrigger(
  title: string,
  snippet: string,
  createdAt?: string | null
): { score: number; why: string } {
  const text = `${title} ${snippet}`.toLowerCase();
  const hits = TRIGGER.filter((p) => text.includes(p));
  let score = hits.length > 0 ? Math.min(18, 8 + hits.length * 4) : 4;
  let why =
    hits.length > 0
      ? `Trigger language: ${hits.slice(0, 2).join(", ")}`
      : "No strong urgency language in the thread.";

  if (createdAt) {
    const ageMs = Date.now() - new Date(createdAt).getTime();
    if (!Number.isNaN(ageMs) && ageMs >= 0) {
      const days = ageMs / (1000 * 60 * 60 * 24);
      if (days <= 2) {
        score += 10;
        why = `${why} Fresh (≤2 days).`.trim();
      } else if (days <= 7) {
        score += 6;
        why = `${why} Recent (this week).`.trim();
      } else if (days <= 30) {
        score += 2;
        why = `${why} Within a month.`.trim();
      } else {
        why = `${why} Older thread; verify still active.`.trim();
      }
    }
  } else {
    why = `${why} Age unknown.`.trim();
  }

  return { score: Math.min(25, score), why };
}

function scoreTrust(opts: {
  platform: "reddit" | "hackernews" | "web";
  sourceLabel?: string;
  subreddit?: string | null;
}): { score: number; kind: TrustPathKind; why: string } {
  if (opts.platform === "hackernews") {
    return {
      score: 16,
      kind: "public_proof",
      why: "Public HN thread. Reply in-thread; no warm intro required.",
    };
  }
  if (opts.platform === "reddit") {
    const sub = opts.subreddit ? `r/${opts.subreddit}` : "Reddit";
    return {
      score: 14,
      kind: "public_proof",
      why: `Public ${sub} thread. Soft reply beats cold DM.`,
    };
  }
  const label = opts.sourceLabel || "public web";
  return {
    score: 10,
    kind: "public_proof",
    why: `Public ${label} hit. Cite the post; avoid cold pitch tone.`,
  };
}

const INTENT_POINTS: Record<IntentLevel, number> = {
  high: 30,
  medium: 15,
  low: 5,
};

export type OpportunityRank = {
  fitWhy: string;
  triggerWhy: string;
  trustPath: TrustPathKind;
  trustWhy: string;
  deservesTimeNow: string;
  priorityScore: number;
};

/**
 * Rank beyond ICP keywords: fit + why now + trust path + composite score.
 */
export function rankOpportunity(opts: {
  product: ProductContext;
  title: string;
  snippet: string;
  intent: IntentLevel;
  platform: "reddit" | "hackernews" | "web";
  sourceLabel?: string;
  subreddit?: string | null;
  createdAt?: string | null;
}): OpportunityRank {
  const fit = scoreFit(opts.product, opts.title, opts.snippet);
  const trigger = scoreTrigger(opts.title, opts.snippet, opts.createdAt);
  const trust = scoreTrust({
    platform: opts.platform,
    sourceLabel: opts.sourceLabel,
    subreddit: opts.subreddit,
  });

  const priorityScore =
    INTENT_POINTS[opts.intent] + fit.score + trigger.score + trust.score;

  const deservesTimeNow =
    opts.intent === "high" || fit.score >= 16
      ? `${fit.why.split(".")[0]}. ${trigger.why.split(".")[0]}. Worth time now.`
      : opts.intent === "medium"
        ? `${fit.why.split(".")[0]}. Check trigger before investing a full pitch.`
        : `Low priority vs stronger hits. Skim only if the thread still fits.`;

  return {
    fitWhy: fit.why,
    triggerWhy: trigger.why,
    trustPath: trust.kind,
    trustWhy: trust.why,
    deservesTimeNow,
    priorityScore,
  };
}
