const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "rain-check" } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            loc: res.headers.location,
            data,
          })
        );
      })
      .on("error", reject);
  });
}

(async () => {
  const pages = [
    "https://MakeItRainApp.com/pricing",
    "https://MakeItRainApp.com/checkout?tier=pro",
    "https://MakeItRainApp.com/login",
  ];
  for (const p of pages) {
    const r = await get(p);
    console.log(p, "status", r.status, "loc", r.loc || "-");
    const keys = r.data.match(/pk_(test|live)_[A-Za-z0-9]+/g) || [];
    console.log("  keys in html:", keys.map((k) => k.slice(0, 18)));
    const scripts = [...r.data.matchAll(/_next\/static\/[^"']+\.js/g)].map(
      (m) => m[0]
    );
    console.log("  scripts", scripts.length);
    for (const s of scripts.slice(0, 60)) {
      const full = "https://MakeItRainApp.com/" + s.replace(/^\//, "");
      const jr = await get(full);
      const found = jr.data.match(/pk_(test|live)_[A-Za-z0-9]+/);
      if (found) {
        console.log("FOUND", found[0].slice(0, 22), "MODE", found[1]);
        return;
      }
    }
  }
  // Search all chunk files from a known recent deploy pattern via RSC flight? skip
  console.log("not found in page scripts");
})().catch(console.error);
