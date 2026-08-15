/**
 * Quick smoke test: HN Algolia + Reddit/DDG demand scan (no Next path aliases).
 * Run: node scripts/test-demand-scan.mjs
 */

const UA = "MakeItRAIN/0.1 (+https://makeitrainapp.com; demand-scan-test)";

async function searchHn(query) {
  const url =
    `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}` +
    `&tags=story&hitsPerPage=5`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return { note: `hn:${res.status}`, hits: [] };
  const data = await res.json();
  return {
    note: "hn:ok",
    hits: (data.hits || []).map((h) => ({
      title: h.title,
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
    })),
  };
}

async function searchReddit(query) {
  const url = `https://www.reddit.com/r/SaaS/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=5&t=year`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) return { note: `reddit:${res.status}`, hits: [] };
  const data = await res.json();
  return {
    note: "reddit:ok",
    hits: (data.data?.children || []).map((c) => ({
      title: c.data.title,
      url: `https://www.reddit.com${c.data.permalink}`,
    })),
  };
}

const q = '"first paying customer" OR "no customers" SaaS';
const hn = await searchHn(q);
const reddit = await searchReddit("first customer");
console.log(
  JSON.stringify(
    {
      hn: { note: hn.note, n: hn.hits.length, sample: hn.hits.slice(0, 2) },
      reddit: {
        note: reddit.note,
        n: reddit.hits.length,
        sample: reddit.hits.slice(0, 2),
      },
    },
    null,
    2
  )
);
