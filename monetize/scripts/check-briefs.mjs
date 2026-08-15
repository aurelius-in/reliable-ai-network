const urls = [
  "https://makeitrainapp.com/r/a4920a00dfc9dee53c51fe4a7d2e0e06fb9d",
  "https://makeitrainapp.com/r/facfff0e0ef989262c9648e5cc1d06c7a6a9",
  "https://makeitrainapp.com/r/7fd05da7dce659e4d0d76eb1a4a14ee55af7",
];

for (const u of urls) {
  const r = await fetch(u);
  const t = await r.text();
  const title = (t.match(/<title>([^<]+)<\/title>/i) || [])[1] || "";
  console.log(
    JSON.stringify({
      status: r.status,
      token: u.split("/").pop().slice(0, 12),
      title: title.slice(0, 100),
      hasPetVax: t.includes("PetVax"),
      hasContentsaurus: t.includes("Contentsaurus"),
      hasAli: t.includes("Ali"),
      hasMirza: t.includes("Mirza"),
    })
  );
}
