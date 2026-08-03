"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleUnsubscribe() {
    if (!email || !token) {
      setStatus("error");
      setMessage("This unsubscribe link is missing information. Reply STOP to any email instead.");
      return;
    }
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not unsubscribe.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again in a moment.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="fade-up mt-8 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-black text-white">Unsubscribe</h1>

        {status === "done" ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            You&apos;re unsubscribed from Make it RAIN checkup emails
            {email ? (
              <>
                {" "}
                for <span className="text-white">{email}</span>
              </>
            ) : null}
            . You won&apos;t get further messages in that sequence.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Stop the Product Monetization Checkup follow-up emails
              {email ? (
                <>
                  {" "}
                  for <span className="text-white">{email}</span>
                </>
              ) : null}
              .
            </p>
            {message && (
              <p className="mt-3 text-sm text-red-400">{message}</p>
            )}
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={status === "loading"}
              className="btn-primary mt-6 w-full"
            >
              {status === "loading" && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Confirm unsubscribe
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-rain-bright hover:underline">
            Back to Make it RAIN
          </Link>
        </p>
      </div>
    </div>
  );
}
