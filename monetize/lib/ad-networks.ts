/**
 * Social + ad networks founders already know.
 * Organic publishing and paid placements — tools tailor copy/posters to each.
 */

export type AdAspectRatio =
  | "1:1"
  | "4:5"
  | "9:16"
  | "16:9"
  | "1.91:1"
  | "2:3";

export type NetworkPlacement = {
  id: string;
  label: string;
  /** Feed / Stories / Shorts / Search — language people recognize */
  kind: "feed" | "story" | "short" | "search" | "display" | "message";
  aspectRatio: AdAspectRatio;
  /** Max primary text guidance for copy (chars), soft */
  maxChars?: number;
};

export type AdNetwork = {
  id: string;
  label: string;
  /** Short line shown under the chip */
  blurb: string;
  organic: boolean;
  paid: boolean;
  /** Paid products people recognize (Meta Ads, LinkedIn Sponsored Content, …) */
  paidProducts: string[];
  placements: NetworkPlacement[];
  /** What Post Writer / Ad Poster produce for this network */
  tools: ("post" | "ad_copy" | "ad_poster" | "dm")[];
  /** ICP fit hint for B2B/indie defaults */
  fit: "b2b" | "b2c" | "both";
};

export const AD_NETWORKS: AdNetwork[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    blurb: "B2B posts, Sponsored Content, Message Ads",
    organic: true,
    paid: true,
    paidProducts: [
      "Sponsored Content",
      "Message Ads",
      "Lead Gen Forms",
      "Dynamic Ads",
    ],
    placements: [
      { id: "feed", label: "Feed post / Sponsored", kind: "feed", aspectRatio: "1.91:1", maxChars: 3000 },
      { id: "square", label: "Square creative", kind: "feed", aspectRatio: "1:1" },
      { id: "story", label: "Vertical / carousel", kind: "story", aspectRatio: "9:16" },
    ],
    tools: ["post", "ad_copy", "ad_poster", "dm"],
    fit: "b2b",
  },
  {
    id: "x",
    label: "X (Twitter)",
    blurb: "Short posts + Promoted Posts",
    organic: true,
    paid: true,
    paidProducts: ["Promoted Posts", "Promoted Trends", "Follower ads"],
    placements: [
      { id: "post", label: "Post / Promoted", kind: "feed", aspectRatio: "16:9", maxChars: 280 },
      { id: "square", label: "Square image", kind: "feed", aspectRatio: "1:1" },
    ],
    tools: ["post", "ad_copy", "ad_poster", "dm"],
    fit: "both",
  },
  {
    id: "facebook",
    label: "Facebook",
    blurb: "Page posts + Meta Ads (Feed, Stories)",
    organic: true,
    paid: true,
    paidProducts: ["Meta Ads", "Boosted posts", "Advantage+"],
    placements: [
      { id: "feed", label: "Feed", kind: "feed", aspectRatio: "1:1", maxChars: 500 },
      { id: "story", label: "Stories", kind: "story", aspectRatio: "9:16" },
      { id: "landscape", label: "Landscape link ad", kind: "display", aspectRatio: "1.91:1" },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "both",
  },
  {
    id: "instagram",
    label: "Instagram",
    blurb: "Feed, Reels, Stories + Meta Ads",
    organic: true,
    paid: true,
    paidProducts: ["Meta Ads", "Boost", "Reels ads", "Stories ads"],
    placements: [
      { id: "feed", label: "Feed", kind: "feed", aspectRatio: "4:5", maxChars: 2200 },
      { id: "reel", label: "Reels cover / ad", kind: "short", aspectRatio: "9:16" },
      { id: "story", label: "Stories", kind: "story", aspectRatio: "9:16" },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "both",
  },
  {
    id: "youtube",
    label: "YouTube",
    blurb: "Organic video + In-stream / Shorts ads",
    organic: true,
    paid: true,
    paidProducts: ["In-stream ads", "Shorts ads", "Discovery ads", "Google Ads"],
    placements: [
      { id: "thumbnail", label: "Thumbnail / poster", kind: "feed", aspectRatio: "16:9" },
      { id: "shorts", label: "Shorts / vertical ad", kind: "short", aspectRatio: "9:16" },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "both",
  },
  {
    id: "tiktok",
    label: "TikTok",
    blurb: "Organic + In-Feed / Spark Ads",
    organic: true,
    paid: true,
    paidProducts: ["In-Feed ads", "Spark Ads", "TopView"],
    placements: [
      { id: "infeed", label: "In-Feed / Spark", kind: "short", aspectRatio: "9:16", maxChars: 150 },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "b2c",
  },
  {
    id: "threads",
    label: "Threads",
    blurb: "Organic text + image posts",
    organic: true,
    paid: false,
    paidProducts: [],
    placements: [
      { id: "post", label: "Feed post", kind: "feed", aspectRatio: "1:1", maxChars: 500 },
    ],
    tools: ["post", "ad_poster"],
    fit: "both",
  },
  {
    id: "reddit",
    label: "Reddit",
    blurb: "Community posts + Reddit Ads",
    organic: true,
    paid: true,
    paidProducts: ["Promoted Posts", "Conversation ads"],
    placements: [
      { id: "post", label: "Post / Promoted", kind: "feed", aspectRatio: "1:1", maxChars: 300 },
      { id: "banner", label: "Display", kind: "display", aspectRatio: "16:9" },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "both",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    blurb: "Pins + Promoted Pins",
    organic: true,
    paid: true,
    paidProducts: ["Promoted Pins", "Shopping ads", "Video pins"],
    placements: [
      { id: "pin", label: "Standard Pin", kind: "feed", aspectRatio: "2:3", maxChars: 500 },
      { id: "story", label: "Idea / story pin", kind: "story", aspectRatio: "9:16" },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "b2c",
  },
  {
    id: "google",
    label: "Google Ads",
    blurb: "Search, Display, Performance Max",
    organic: false,
    paid: true,
    paidProducts: ["Search", "Display", "Performance Max", "Demand Gen"],
    placements: [
      { id: "display", label: "Display / PMax creative", kind: "display", aspectRatio: "1.91:1" },
      { id: "square", label: "Square", kind: "display", aspectRatio: "1:1" },
      { id: "story", label: "Vertical Discovery", kind: "story", aspectRatio: "9:16" },
    ],
    tools: ["ad_copy", "ad_poster"],
    fit: "both",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    blurb: "Stories + Snap Ads",
    organic: true,
    paid: true,
    paidProducts: ["Snap Ads", "Story Ads", "Collection Ads"],
    placements: [
      { id: "story", label: "Story / Snap Ad", kind: "story", aspectRatio: "9:16" },
    ],
    tools: ["post", "ad_copy", "ad_poster"],
    fit: "b2c",
  },
  {
    id: "bluesky",
    label: "Bluesky",
    blurb: "Organic posts (no major ads yet)",
    organic: true,
    paid: false,
    paidProducts: [],
    placements: [
      { id: "post", label: "Feed post", kind: "feed", aspectRatio: "16:9", maxChars: 300 },
    ],
    tools: ["post", "ad_poster"],
    fit: "both",
  },
  {
    id: "discord",
    label: "Discord",
    blurb: "Server announcements + community",
    organic: true,
    paid: false,
    paidProducts: [],
    placements: [
      { id: "announce", label: "Announcement graphic", kind: "feed", aspectRatio: "16:9" },
    ],
    tools: ["post", "ad_poster"],
    fit: "both",
  },
  {
    id: "producthunt",
    label: "Product Hunt",
    blurb: "Launch day assets",
    organic: true,
    paid: false,
    paidProducts: [],
    placements: [
      { id: "gallery", label: "Gallery / thumbnail", kind: "feed", aspectRatio: "16:9" },
      { id: "square", label: "Maker badge / square", kind: "feed", aspectRatio: "1:1" },
    ],
    tools: ["post", "ad_poster"],
    fit: "b2b",
  },
  {
    id: "newsletter",
    label: "Newsletter / email",
    blurb: "Owned list — Newsletter Writer",
    organic: true,
    paid: false,
    paidProducts: [],
    placements: [
      { id: "header", label: "Header / hero image", kind: "display", aspectRatio: "16:9" },
    ],
    tools: ["post", "ad_poster"],
    fit: "both",
  },
];

export function getAdNetwork(id: string): AdNetwork | undefined {
  return AD_NETWORKS.find((n) => n.id === id);
}

export function networkChipOptions(
  filter?: "organic" | "paid" | "poster"
): { value: string; label: string }[] {
  return AD_NETWORKS.filter((n) => {
    if (filter === "organic") return n.organic;
    if (filter === "paid") return n.paid;
    if (filter === "poster") return n.tools.includes("ad_poster");
    return true;
  }).map((n) => ({ value: n.id, label: n.label }));
}

/** Map our placement ratios to Grok Imagine aspect_ratio strings. */
export function toImagineAspectRatio(
  ratio: AdAspectRatio
): "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" {
  switch (ratio) {
    case "1:1":
      return "1:1";
    case "16:9":
    case "1.91:1":
      return "16:9";
    case "9:16":
      return "9:16";
    case "4:5":
      return "3:4";
    case "2:3":
      return "2:3";
    default:
      return "1:1";
  }
}

export function formatNetworksForPrompt(networkIds: string[]): string {
  const lines: string[] = [];
  for (const id of networkIds) {
    const n = getAdNetwork(id);
    if (!n) continue;
    const mode = [
      n.organic ? "organic" : null,
      n.paid ? `paid (${n.paidProducts.slice(0, 3).join(", ")})` : null,
    ]
      .filter(Boolean)
      .join(" + ");
    lines.push(
      `- ${n.label} [${mode}]: tailor copy to this network's norms. Placements: ${n.placements.map((p) => p.label).join(", ")}.`
    );
  }
  return lines.join("\n");
}
