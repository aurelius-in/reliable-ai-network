/**

 * DuckDuckGo HTML search for site:-scoped community queries.

 */



export type WebHit = {

  id: string;

  title: string;

  url: string;

  snippet: string;

  host: string;

};



function decodeHtml(s: string): string {

  return s

    .replace(/&amp;/g, "&")

    .replace(/&lt;/g, "<")

    .replace(/&gt;/g, ">")

    .replace(/&quot;/g, '"')

    .replace(/&#x27;/g, "'")

    .replace(/&#39;/g, "'");

}



export async function searchDuckDuckGoSite(

  query: string,

  host: string,

  options?: { limit?: number }

): Promise<{ hits: WebHit[]; note: string }> {

  const limit = Math.min(options?.limit ?? 4, 8);

  const q = `site:${host} ${query}`;

  const body = new URLSearchParams({ q });



  try {

    const res = await fetch("https://html.duckduckgo.com/html/", {

      method: "POST",

      headers: {

        "Content-Type": "application/x-www-form-urlencoded",

        "User-Agent":

          process.env.REDDIT_USER_AGENT?.trim() ||

          "MakeItRAIN/0.1 (+https://makeitrainapp.com)",

      },

      body,

      signal: AbortSignal.timeout(8_000),

    });

    if (!res.ok) {

      return { hits: [], note: `ddg:${host}:http_${res.status}` };

    }

    const html = await res.text();

    const hits: WebHit[] = [];

    const linkRe =

      /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

    let m: RegExpExecArray | null;

    while ((m = linkRe.exec(html)) && hits.length < limit) {

      let href = decodeHtml(m[1]);

      const title = decodeHtml(m[2].replace(/<[^>]+>/g, "")).trim();

      const uddg = href.match(/[?&]uddg=([^&]+)/);

      if (uddg) {

        try {

          href = decodeURIComponent(uddg[1]);

        } catch {

          /* keep */

        }

      }

      if (!href.toLowerCase().includes(host.replace(/^www\./, ""))) continue;

      if (!title) continue;

      const slug = href.replace(/[^a-zA-Z0-9]/g, "").slice(-20);

      hits.push({

        id: `web_${host}_${hits.length}_${slug}`,

        title,

        url: href.split("?")[0],

        snippet: `Public result on ${host} for: ${query}`,

        host,

      });

    }

    return {

      hits,

      note: hits.length ? `ddg:${host}:ok` : `ddg:${host}:empty`,

    };

  } catch {

    return { hits: [], note: `ddg:${host}:error` };

  }

}



/** @deprecated use searchDuckDuckGoSite */

export async function searchDuckDuckGoReddit(

  query: string,

  options?: { limit?: number }

): Promise<{ hits: Omit<WebHit, "host">[]; note: string }> {

  const { hits, note } = await searchDuckDuckGoSite(query, "reddit.com", options);

  return {

    hits: hits.map(({ id, title, url, snippet }) => ({

      id,

      title,

      url,

      snippet,

    })),

    note,

  };

}


