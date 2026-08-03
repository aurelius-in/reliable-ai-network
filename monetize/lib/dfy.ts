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
    description:
      "Full offer / sales page draft for your product, aimed at a clear paid CTA.",
  },
  {
    id: "ad_set",
    emoji: "📣",
    label: "Campaign ad set (5)",
    description:
      "Five ad variations for LinkedIn, Meta, or YouTube, sized for a thin budget test.",
  },
  {
    id: "email_launch",
    emoji: "✉️",
    label: "Email launch sequence",
    description:
      "A 5-email sequence that warms, handles objections, and asks for the sale or demo.",
  },
  {
    id: "listing_overhaul",
    emoji: "🛍️",
    label: "Listing / store page overhaul",
    description:
      "App Store, marketplace, or product listing rewritten to convert browsers into buyers.",
  },
  {
    id: "brand_kit",
    emoji: "🎨",
    label: "Positioning kit",
    description:
      "Name options, tagline, one-liner pitch, and bio language that sound operator-grade.",
  },
];

export const DFY_STATUS_LABELS: Record<string, string> = {
  queued: "In queue",
  in_progress: "Being crafted",
  delivered: "Delivered",
};
