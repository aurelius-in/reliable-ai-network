"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/track";

export function PortalButton({
  label = "Manage / Cancel subscription",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    track("billing_portal_open", { label });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal");
      }
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      track("billing_portal_error", { message: message.slice(0, 160) });
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-xl border border-night-600 bg-night-700 px-5 py-2.5 font-semibold text-white transition hover:border-rain hover:bg-night-600 disabled:opacity-60"
        }
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
