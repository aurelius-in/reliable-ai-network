/** Product-aware defaults for Funnel / Traffic / Content / Sales chips. */

import type { BuyerProfilesResult, Creation } from "@/types";

export function defaultAudienceFromBuyers(
  buyers?: BuyerProfilesResult | null
): string {
  const blob = [
    buyers?.best_first_target,
    buyers?.personas?.[0]?.who,
    buyers?.personas?.[0]?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (blob.includes("developer") || blob.includes("engineer")) {
    return "developers and technical teams";
  }
  if (blob.includes("enterprise") || blob.includes("security")) {
    return "enterprise IT and security";
  }
  if (blob.includes("agency") || blob.includes("consult")) {
    return "agencies and consultancies";
  }
  if (blob.includes("smb") || blob.includes("small business") || blob.includes("operator")) {
    return "SMB operators";
  }
  if (blob.includes("revops") || blob.includes("ops")) {
    return "internal ops and RevOps";
  }
  return "B2B SaaS buyers";
}

export function defaultTargetBuyerFromBuyers(
  buyers?: BuyerProfilesResult | null
): string {
  const blob = [
    buyers?.best_first_target,
    buyers?.personas?.[0]?.who,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (blob.includes("founder") || blob.includes("startup")) {
    return "startup founders and teams";
  }
  if (blob.includes("champion") || blob.includes("technical") || blob.includes("engineer")) {
    return "technical champions";
  }
  if (blob.includes("smb") || blob.includes("owner") || blob.includes("operator")) {
    return "SMB owners and operators";
  }
  return "economic buyers (VP / C-level)";
}

export function defaultMotionFromCreation(
  creation?: Creation | null
): "outbound" | "plg" | "hybrid" {
  const stage = (creation as { stage?: string } | null | undefined)?.stage?.toLowerCase();
  if (stage?.includes("growth") || stage?.includes("scale")) return "hybrid";
  if (stage?.includes("product") || stage?.includes("plg")) return "plg";
  return "outbound";
}

export function defaultComfortFromBuyers(
  buyers?: BuyerProfilesResult | null
): string {
  const where = (buyers?.personas?.[0]?.where_online ?? [])
    .join(" ")
    .toLowerCase();
  if (where.includes("linkedin") || where.includes("email")) {
    return "strong on LinkedIn and email";
  }
  if (where.includes("demo") || where.includes("call") || where.includes("zoom")) {
    return "comfortable on founder calls and demos";
  }
  if (where.includes("partner") || where.includes("channel")) {
    return "prefers partner or AE-assisted sales";
  }
  return "prefers written outbound over video";
}
