/**
 * Hacker News search via Algolia public API (no key required).
 * https://hn.algolia.com/api
 */

export type HnHit = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  createdAt: string | null;
  points: number;
  numComments: number;
};

export async function searchHackerNews(
  query: string,
  options?: { limit?: number }
): Promise<{ hits: HnHit[]; note: string }> {
  const limit = Math.min(options?.limit ?? 8, 15);
  const url =
    `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}` +
    `&tags=story&hitsPerPage=${limit}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      return { hits: [], note: `hn:http_${res.status}` };
    }
    const data = (await res.json()) as {
      hits?: {
        objectID?: string;
        title?: string;
        url?: string | null;
        story_text?: string | null;
        created_at?: string;
        points?: number;
        num_comments?: number;
      }[];
    };
    const hits: HnHit[] = [];
    for (const h of data.hits ?? []) {
      if (!h.objectID || !h.title) continue;
      hits.push({
        id: `hn_${h.objectID}`,
        title: h.title,
        url: `https://news.ycombinator.com/item?id=${h.objectID}`,
        snippet: (h.story_text || h.url || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 280),
        createdAt: h.created_at ?? null,
        points: h.points ?? 0,
        numComments: h.num_comments ?? 0,
      });
    }
    return { hits, note: "hn:algolia" };
  } catch {
    return { hits: [], note: "hn:error" };
  }
}
