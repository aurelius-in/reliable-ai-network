"use client";

import { useEffect } from "react";
import { savePendingProductUrl } from "@/lib/pending-product-url";

/** Capture ?url= from signup into sessionStorage for onboarding. */
export function PersistProductUrl({ url }: { url?: string }) {
  useEffect(() => {
    if (url?.trim()) savePendingProductUrl(url);
  }, [url]);
  return null;
}
