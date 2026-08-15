const checks = [
  {
    id: "A",
    url: "https://makeitrainapp.com/r/3e8c70e39bd350961d9c0a88e7182e9b323f",
    bad: ["PetVax", "petvax", "Ali Nawaz", "Ali"],
  },
  {
    id: "C",
    url: "https://makeitrainapp.com/r/b464a9702a86973e5c304f99fa208ab5956e",
    bad: ["Contentsaurus", "contentsaurus", "Mirza"],
  },
];

for (const c of checks) {
  const t = await (await fetch(c.url)).text();
  const hits = c.bad.filter((b) => t.includes(b));
  console.log(
    JSON.stringify({
      id: c.id,
      ok: hits.length === 0,
      hasRedact: t.includes("████████"),
      leaks: hits,
      title: (t.match(/<title>([^<]+)<\/title>/i) || [])[1],
    })
  );
}
