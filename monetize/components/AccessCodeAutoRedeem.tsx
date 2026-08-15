"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACCESS_CODE_STORAGE_KEY,
  normalizeAccessCode,
} from "@/lib/access-codes";
import { track } from "@/lib/track";

/**
 * Silent redeem for invite links. Prefer server redeem on auth confirm;
 * this catches same-browser session paths and retries after transient fails.
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
        const data = await res.json().catch(() => ({}));

        // Only drop the code on definitive outcomes. Keep it on 401/404/5xx
        // so a later visit (after session/profile exists) can still redeem.
        const definitiveFail = res.status === 400 || res.status === 409;
        if (!res.ok) {
          if (definitiveFail) {
            try {
              localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
            } catch {
              /* ignore */
            }
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
