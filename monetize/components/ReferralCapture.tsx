"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  REFERRAL_STORAGE_KEY,
  normalizeReferralCode,
} from "@/lib/referrals";

/** Persists ?ref= from any page so signup / checkout can attribute later. */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = normalizeReferralCode(searchParams.get("ref"));
    if (!code) return;
    try {
      localStorage.setItem(REFERRAL_STORAGE_KEY, code);
    } catch {
      /* ignore private mode */
    }
  }, [searchParams]);

  return null;
}
