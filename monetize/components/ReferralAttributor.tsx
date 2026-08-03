"use client";

import { useEffect } from "react";
import { REFERRAL_STORAGE_KEY, normalizeReferralCode } from "@/lib/referrals";

/** After login/signup, attach any stored referral code once. */
export function ReferralAttributor() {
  useEffect(() => {
    let code: string | null = null;
    try {
      code = normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
    } catch {
      return;
    }
    if (!code) return;

    void fetch("/api/referral/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; reason?: string };
        // Clear once applied or permanently invalid for this user.
        if (
          data.ok ||
          data.reason === "already_set" ||
          data.reason === "self" ||
          data.reason === "not_found"
        ) {
          try {
            localStorage.removeItem(REFERRAL_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
