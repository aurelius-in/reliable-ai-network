/**
 * Done-For-You (Pro Tab 8) — asset types a Pro member can request,
 * one per calendar month. Requests are stored in `generated_assets`
 * with type "dfy_request".
 */

export const DFY_ASSET_TYPE = "dfy_request";

export interface DfyAssetOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export const DFY_ASSET_OPTIONS: DfyAssetOption[] = [
  {
    id: "offer_page",
    emoji: "📝",
    label: "Offer page copy",
    description: "A complete high-converting sales page, written for your product.",
  },
  {
    id: "ad_set",
    emoji: "📣",
    label: "Ad set (5 ads)",
    description: "Five scroll-stopping ad variations ready for Meta, YouTube, or TikTok.",
  },
  {
    id: "email_launch",
    emoji: "✉️",
    label: "Email launch sequence",
    description: "A 5-email launch sequence that builds hype and closes sales.",
  },
  {
    id: "listing_overhaul",
    emoji: "🛍️",
    label: "Marketplace listing overhaul",
    description: "Your Gumroad / App Store listing rewritten to convert browsers into buyers.",
  },
  {
    id: "brand_kit",
    emoji: "🎨",
    label: "Mini brand kit",
    description: "Name options, tagline, bio, and a one-liner pitch that make you look pro.",
  },
];

export const DFY_STATUS_LABELS: Record<string, string> = {
  queued: "In queue",
  in_progress: "Being crafted",
  delivered: "Delivered",
};
