"use client";

import { useEffect } from "react";
import {
  ACCESS_CODE_STORAGE_KEY,
  normalizeAccessCode,
} from "@/lib/access-codes";
import { track } from "@/lib/track";

/** Stashes the mapped access code for silent redeem after signup. */
export function InviteBootstrap({ accessCode }: { accessCode: string }) {
  useEffect(() => {
    const code = normalizeAccessCode(accessCode);
    if (!code) return;
    try {
      localStorage.setItem(ACCESS_CODE_STORAGE_KEY, code);
      track("invite_bootstrap", { code: code.slice(0, 8) });
    } catch {
      /* ignore */
    }
  }, [accessCode]);

  return null;
}
