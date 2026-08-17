"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ACCESS_CODE_STORAGE_KEY,
  normalizeAccessCode,
} from "@/lib/access-codes";
import { track } from "@/lib/track";

export function AccessCodeForm({
  heading = "Have an access code?",
}: {
  heading?: string;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function redeem(raw: string) {
    const normalized = normalizeAccessCode(raw);
    if (!normalized) {
      setError("Enter the code from your email.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      try {
        localStorage.setItem(ACCESS_CODE_STORAGE_KEY, normalized);
      } catch {
        /* ignore */
      }
      const res = await fetch("/api/access-code/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setMessage("Sign in, then this page will apply the code.");
        return;
      }
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Could not apply that code."
        );
        track("access_code_redeem_error");
        return;
      }
      try {
        localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      track("access_code_redeem_success", { code: normalized });
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
            ? `Access already active through ${end}.`
            : "Access already active."
          : end
            ? `${data.label || "Access"} unlocked through ${end}.`
            : `${data.label || "Access"} unlocked.`
      );
    } catch {
      setError("Could not apply that code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void redeem(code);
      }}
      className="rounded-2xl border border-white/10 bg-night-800/80 px-4 py-4"
    >
      <p className="text-sm font-semibold text-white">{heading}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          autoComplete="off"
          spellCheck={false}
          className="input-dark flex-1 font-mono tracking-wide"
          aria-label="Access code"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary shrink-0 !px-4 !py-2.5 text-sm"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Apply code
        </button>
      </div>
      {message ? (
        <p className="mt-2 text-sm text-aqua-bright">{message}</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
