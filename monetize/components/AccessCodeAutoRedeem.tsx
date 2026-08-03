"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACCESS_CODE_STORAGE_KEY,
  normalizeAccessCode,
} from "@/lib/access-codes";
import { track } from "@/lib/track";

/**
 * Silent redeem for invite links (?access=CODE). No public “enter a code”
 * UI — only runs when a code was captured from the URL.
 */
export function AccessCodeAutoRedeem() {
  const router = useRouter();
  const ran = useRef(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let stored: string | null = null;
    try {
      stored = normalizeAccessCode(
        localStorage.getItem(ACCESS_CODE_STORAGE_KEY)
      );
    } catch {
      return;
    }
    if (!stored) return;

    void (async () => {
      try {
        const res = await fetch("/api/access-code/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: stored }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Invalid / already paid — drop the stored code so we don't retry.
          try {
            localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          track("access_code_redeem_error");
          return;
        }
        try {
          localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        track("access_code_redeem_success", { code: stored });
        const end = data.endsAt
          ? new Date(data.endsAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : null;
        setMessage(
          data.alreadyActive
            ? end
              ? `Access active through ${end}.`
              : "Access already active."
            : end
              ? `${data.label} unlocked through ${end}.`
              : `${data.label} unlocked.`
        );
        router.refresh();
      } catch {
        track("access_code_redeem_error");
      }
    })();
  }, [router]);

  if (!message) return null;

  return (
    <div className="fade-up rounded-2xl border border-aqua/30 bg-aqua/10 px-5 py-3 text-sm text-aqua-bright">
      {message}
    </div>
  );
}
