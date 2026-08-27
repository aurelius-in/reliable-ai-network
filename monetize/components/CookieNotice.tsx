"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "rain_cookie_notice_v1";

/**
 * Light first-party analytics notice (session id + UTM in local/session storage).
 * Not a hard GDPR wall — dismiss records acknowledgment.
 */
export function CookieNotice() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/select")) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [pathname]);

  if (pathname?.startsWith("/select")) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics notice"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-night-800/95 p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-slate-300">
          We use local storage for session analytics and marketing attribution
          (like UTM links) so we can improve Make it RAIN. See our{" "}
          <Link href="/privacy" className="font-semibold text-aqua hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
