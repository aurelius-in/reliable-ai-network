"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, track } from "@/lib/track";
import { pixelPageView } from "@/lib/meta-pixel";

/**
 * Auto page_view on route changes + one-shot query flags
 * (checkout canceled, auth error, etc.).
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstView = useRef(true);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (pathname.startsWith("/select")) return;
    trackPageView(pathname);
    if (firstView.current) {
      firstView.current = false;
    } else {
      pixelPageView();
    }

    const checkout = searchParams.get("checkout");
    if (checkout === "canceled") {
      track("checkout_canceled", { page: pathname });
    } else if (checkout === "success") {
      track("checkout_success", { page: pathname });
    }

    const error = searchParams.get("error");
    if (error === "auth") {
      track("auth_callback_error", { page: pathname });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
