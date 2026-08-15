/**
 * Daily Market Research scan across 25+ public communities.
 * HN + Reddit direct where possible; other sources via web index site: queries.
 */

import { buildDemandQueries } from "@/lib/demand-discovery/queries";
import {
  DAILY_MARKET_RESEARCH_SOURCES,
  DAILY_MARKET_RESEARCH_SOURCE_COUNT,
} from "@/lib/demand-discovery/sources";
import {
  DEFAULT_DEMAND_SUBREDDITS,
  searchReddit,
} from "@/lib/demand-discovery/providers/reddit";
import { searchHackerNews } from "@/lib/demand-discovery/providers/hackernews";
import { searchDuckDuckGoSite } from "@/lib/demand-discovery/providers/duckduckgo";
import {
  draftOutreach,
  rankOpportunity,
  scoreIntent,
} from "@/lib/demand-discovery/score";
import type {
  DemandScanResult,
  DemandSignal,
} from "@/lib/demand-discovery/types";
import type { ProductContext } from "@/lib/product-context";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function platformForHost(host: string): DemandSignal["platform"] {
  if (host.includes("reddit")) return "reddit";
  if (host.includes("ycombinator") || host.includes("news.ycombinator"))
    return "hackernews";
  return "web";
}

function buildSignal(
  product: ProductContext,
  base: Omit<
    DemandSignal,
    | "intent"
    | "whyMatch"
    | "outreachDraft"
    | "fitWhy"
    | "triggerWhy"
    | "trustPath"
    | "trustWhy"
    | "deservesTimeNow"
    | "priorityScore"
  > & { title: string; snippet: string }
): DemandSignal {
  const { intent, why } = scoreIntent(base.title, base.snippet);
  const rank = rankOpportunity({
    product,
    title: base.title,
    snippet: base.snippet,
    intent,
    platform: base.platform,
    sourceLabel: base.sourceLabel,
    subreddit: base.subreddit,
    createdAt: base.createdAt,
  });

  return {
    ...base,
    intent,
    whyMatch: why,
    outreachDraft: draftOutreach({
      productTitle: product.title,
      threadTitle: base.title,
    }),
    fitWhy: rank.fitWhy,
    triggerWhy: rank.triggerWhy,
    trustPath: rank.trustPath,
    trustWhy: rank.trustWhy,
    deservesTimeNow: rank.deservesTimeNow,
    priorityScore: rank.priorityScore,
  };
}

export async function runDemandScan(
  product: ProductContext,
  options?: { maxSignals?: number }
): Promise<DemandScanResult> {
  const maxSignals = options?.maxSignals ?? 18;
  const queries = buildDemandQueries(product);
  const providerNotes: string[] = [
    `daily_market_research:${DAILY_MARKET_RESEARCH_SOURCE_COUNT}_sources`,
  ];
  const byUrl = new Map<string, DemandSignal>();
  const sourcesHit: string[] = [];

  for (const query of queries.slice(0, 3)) {
    const { hits, note } = await searchHackerNews(query, { limit: 5 });
    if (!providerNotes.includes(note)) providerNotes.push(note);
    if (hits.length && !sourcesHit.includes("Hacker News")) {
      sourcesHit.push("Hacker News");
    }
    for (const h of hits) {
      if (byUrl.has(h.url)) continue;
      byUrl.set(
        h.url,
        buildSignal(product, {
          id: h.id,
          platform: "hackernews",
          title: h.title,
          url: h.url,
          snippet: h.snippet,
          createdAt: h.createdAt,
          queryUsed: query,
          sourceLabel: "Hacker News",
        })
      );
    }
    await sleep(120);
  }

  let redditOk = false;
  for (const query of queries.slice(0, 2)) {
    for (const sub of DEFAULT_DEMAND_SUBREDDITS.slice(0, 2)) {
      const { hits, note } = await searchReddit(query, {
        subreddit: sub,
        limit: 4,
      });
      if (!providerNotes.includes(note)) providerNotes.push(note);
      if (hits.length) {
        redditOk = true;
        if (!sourcesHit.includes("Reddit")) sourcesHit.push("Reddit");
      }
      for (const h of hits) {
        if (byUrl.has(h.url)) continue;
        byUrl.set(
          h.url,
          buildSignal(product, {
            id: h.id,
            platform: "reddit",
            title: h.title,
            url: h.url,
            snippet: h.snippet,
            subreddit: h.subreddit,
            createdAt: h.createdAt,
            queryUsed: query,
            sourceLabel: "Reddit",
          })
        );
      }
      await sleep(200);
    }
  }

  const webSources = DAILY_MARKET_RESEARCH_SOURCES.filter(
    (s) => s.mode === "web" || (s.mode === "reddit" && !redditOk)
  ).slice(0, 20);
  const primaryQuery = queries[0] ?? product.title;

  // Parallel batches so 25+ sources finish inside serverless budget
  const batchSize = 5;
  for (let i = 0; i < webSources.length; i += batchSize) {
    const batch = webSources.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((source) =>
        searchDuckDuckGoSite(primaryQuery, source.host, { limit: 3 }).then(
          (r) => ({ source, ...r })
        )
      )
    );
    for (const { source, hits, note } of results) {
      if (!providerNotes.includes(note)) providerNotes.push(note);
      if (hits.length && !sourcesHit.includes(source.label)) {
        sourcesHit.push(source.label);
      }
      for (const h of hits) {
        if (byUrl.has(h.url)) continue;
        byUrl.set(
          h.url,
          buildSignal(product, {
            id: h.id,
            platform: platformForHost(source.host),
            title: h.title,
            url: h.url,
            snippet: h.snippet,
            createdAt: null,
            queryUsed: primaryQuery,
            sourceLabel: source.label,
          })
        );
      }
    }
    await sleep(200);
  }

  const intentRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const signals = [...byUrl.values()]
    .sort((a, b) => {
      const pa = b.priorityScore ?? 0;
      const pb = a.priorityScore ?? 0;
      if (pa !== pb) return pa - pb;
      return intentRank[a.intent] - intentRank[b.intent];
    })
    .slice(0, maxSignals);

  return {
    productTitle: product.title,
    queries,
    signals,
    providerNotes,
    scannedAt: new Date().toISOString(),
    sourcesTargeted: DAILY_MARKET_RESEARCH_SOURCE_COUNT,
    sourcesHit,
  };
}
