/**
 * Daily Market Research — public communities we attempt to search each run.
 * Promise: impressive breadth (25+). Reality: mix of direct APIs + web index
 * site: queries. Some sources return thin/empty on a given day — that is the
 * "barely possible" edge vs tools that only cover Reddit.
 */

export type MarketResearchSource = {
  id: string;
  label: string;
  /** Host used in site: queries / attribution */
  host: string;
  /** Direct API when available */
  mode: "hackernews" | "reddit" | "web";
};

/** Ordered list shown in product UI and marketing (25+). */
export const DAILY_MARKET_RESEARCH_SOURCES: MarketResearchSource[] = [
  { id: "reddit", label: "Reddit", host: "reddit.com", mode: "reddit" },
  { id: "hn", label: "Hacker News", host: "news.ycombinator.com", mode: "hackernews" },
  { id: "lobsters", label: "Lobsters", host: "lobste.rs", mode: "web" },
  { id: "so", label: "Stack Overflow", host: "stackoverflow.com", mode: "web" },
  { id: "github", label: "GitHub", host: "github.com", mode: "web" },
  { id: "ph", label: "Product Hunt", host: "producthunt.com", mode: "web" },
  { id: "ih", label: "Indie Hackers", host: "indiehackers.com", mode: "web" },
  { id: "devto", label: "DEV Community", host: "dev.to", mode: "web" },
  { id: "hashnode", label: "Hashnode", host: "hashnode.com", mode: "web" },
  { id: "medium", label: "Medium", host: "medium.com", mode: "web" },
  { id: "quora", label: "Quora", host: "quora.com", mode: "web" },
  { id: "youtube", label: "YouTube", host: "youtube.com", mode: "web" },
  { id: "slashdot", label: "Slashdot", host: "slashdot.org", mode: "web" },
  { id: "discourse", label: "Meta Discourse", host: "meta.discourse.org", mode: "web" },
  { id: "lemmy", label: "Lemmy", host: "lemmy.world", mode: "web" },
  { id: "bluesky", label: "Bluesky", host: "bsky.app", mode: "web" },
  { id: "mastodon", label: "Mastodon", host: "mastodon.social", mode: "web" },
  { id: "tumblr", label: "Tumblr", host: "tumblr.com", mode: "web" },
  { id: "substack", label: "Substack", host: "substack.com", mode: "web" },
  { id: "growthhackers", label: "GrowthHackers", host: "growthhackers.com", mode: "web" },
  { id: "betalist", label: "BetaList", host: "betalist.com", mode: "web" },
  { id: "wellfound", label: "Wellfound", host: "wellfound.com", mode: "web" },
  { id: "saas_hub", label: "SaaS Hub", host: "saashub.com", mode: "web" },
  { id: "g2", label: "G2", host: "g2.com", mode: "web" },
  { id: "capterra", label: "Capterra", host: "capterra.com", mode: "web" },
  { id: "alternativeto", label: "AlternativeTo", host: "alternativeto.net", mode: "web" },
  { id: "softwaredaily", label: "Software Daily", host: "softwaredaily.com", mode: "web" },
];

export const DAILY_MARKET_RESEARCH_SOURCE_COUNT =
  DAILY_MARKET_RESEARCH_SOURCES.length;

export const DAILY_MARKET_RESEARCH_PROMISE = `${DAILY_MARKET_RESEARCH_SOURCE_COUNT}+ public communities`;

export function marketResearchSourceLabels(): string[] {
  return DAILY_MARKET_RESEARCH_SOURCES.map((s) => s.label);
}

