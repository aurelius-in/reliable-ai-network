import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL || "https://makeitrainapp.com"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const host = (await headers()).get("host") || "";
  if (host.toLowerCase().includes("rainselect")) {
    return [
      {
        url: "https://rainselect.com",
        lastModified: now,
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
  const paths: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/deal-economics", changeFrequency: "weekly", priority: 0.85 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
    { path: "/reviews", changeFrequency: "weekly", priority: 0.75 },
    { path: "/checklist", changeFrequency: "monthly", priority: 0.8 },
    { path: "/signup", changeFrequency: "monthly", priority: 0.7 },
    { path: "/login", changeFrequency: "monthly", priority: 0.5 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.4 },
  ];

  return paths.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
