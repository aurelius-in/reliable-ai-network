/**
 * Reddit search via public JSON endpoints.
 * Set REDDIT_USER_AGENT in env (required for reliable access).
 * Optional REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET for OAuth (future).
 */

export type RedditHit = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  subreddit: string | null;
  createdAt: string | null;
  score: number;
  numComments: number;
};

const DEFAULT_UA =
  process.env.REDDIT_USER_AGENT?.trim() ||
  "MakeItRAIN/0.1 (demand-discovery; +https://makeitrainapp.com)";

async function fetchRedditJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": DEFAULT_UA,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function parseListing(json: unknown, query: string): RedditHit[] {
  const data = json as {
    data?: {
      children?: {
        data?: {
          id?: string;
          title?: string;
          selftext?: string;
          permalink?: string;
          subreddit?: string;
          created_utc?: number;
          score?: number;
          num_comments?: number;
        };
      }[];
    };
  };
  const children = data?.data?.children ?? [];
  const hits: RedditHit[] = [];
  for (const child of children) {
    const d = child.data;
    if (!d?.id || !d.title || !d.permalink) continue;
    const snippet = (d.selftext || "").replace(/\s+/g, " ").trim().slice(0, 280);
    hits.push({
      id: `reddit_${d.id}`,
      title: d.title,
      url: `https://www.reddit.com${d.permalink}`,
      snippet: snippet || `Reddit thread matching: ${query}`,
      subreddit: d.subreddit ?? null,
      createdAt: d.created_utc
        ? new Date(d.created_utc * 1000).toISOString()
        : null,
      score: d.score ?? 0,
      numComments: d.num_comments ?? 0,
    });
  }
  return hits;
}

/** Search a subreddit, then fall back to sitewide Reddit search. */
export async function searchReddit(
  query: string,
  options?: { subreddit?: string; limit?: number }
): Promise<{ hits: RedditHit[]; note: string }> {
  const limit = Math.min(options?.limit ?? 8, 15);
  const q = encodeURIComponent(query);

  if (options?.subreddit) {
    const sr = encodeURIComponent(options.subreddit.replace(/^r\//, ""));
    const url = `https://www.reddit.com/r/${sr}/search.json?q=${q}&restrict_sr=1&sort=new&limit=${limit}&t=year`;
    const json = await fetchRedditJson(url);
    if (json) {
      return {
        hits: parseListing(json, query),
        note: `reddit:r/${options.subreddit}`,
      };
    }
  }

  const globalUrl = `https://www.reddit.com/search.json?q=${q}&sort=new&limit=${limit}&t=year&type=link`;
  const global = await fetchRedditJson(globalUrl);
  if (global) {
    return { hits: parseListing(global, query), note: "reddit:search" };
  }

  return {
    hits: [],
    note: "reddit:blocked_or_empty (set REDDIT_USER_AGENT; retries from prod IP often work)",
  };
}

/** Default subreddits for SaaS / builder ICP. */
export const DEFAULT_DEMAND_SUBREDDITS = [
  "SaaS",
  "startups",
  "indiehackers",
  "Entrepreneur",
  "smallbusiness",
] as const;
