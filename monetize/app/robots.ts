import type { MetadataRoute } from "next";

const SITE = (
  process.env.NEXT_PUBLIC_APP_URL || "https://makeitrainapp.com"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard",
          "/billing",
          "/checkout",
          "/architecture",
          "/intel/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
