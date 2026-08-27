import type { MetadataRoute } from "next";
import { headers } from "next/headers";

const MIR = (
  process.env.NEXT_PUBLIC_APP_URL || "https://makeitrainapp.com"
).replace(/\/$/, "");

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") || "";
  if (host.toLowerCase().includes("rainselect")) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/", "/api/", "/select"],
        },
      ],
      sitemap: "https://rainselect.com/sitemap.xml",
    };
  }

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
          "/select",
        ],
      },
    ],
    sitemap: `${MIR}/sitemap.xml`,
  };
}
