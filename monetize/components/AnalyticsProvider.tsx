"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, track } from "@/lib/track";

/**
 * Auto page_view on route changes + one-shot query flags
 * (checkout canceled, auth error, etc.).
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    // Skip noisy admin polling of itself
    if (pathname.startsWith("/admin")) return;
    trackPageView(pathname);

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
