"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ACCESS_CODE_STORAGE_KEY,
  normalizeAccessCode,
} from "@/lib/access-codes";
import { lookupInviteToken } from "@/lib/invite-tokens";

/** Persists ?access=, ?code=, or ?invite= for redeem after signup/login. */
export function AccessCodeCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const invite = lookupInviteToken(searchParams.get("invite"));
    const raw =
      invite?.accessCode ??
      searchParams.get("access") ??
      searchParams.get("code");
    const code = normalizeAccessCode(raw);
    if (!code) return;
    try {
      localStorage.setItem(ACCESS_CODE_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  return null;
}
