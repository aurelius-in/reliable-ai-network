import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Make it RAIN",
    short_name: "Make it RAIN",
    description:
      "Turn what you've built into income — 15 monetization tools in your pocket.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070a12",
    theme_color: "#070a12",
    icons: [
      {
        src: "/icons/icon-192.png?v=3",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192.png?v=3",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
