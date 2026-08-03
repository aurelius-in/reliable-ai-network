"use client";

import { FormEvent, useState } from "react";
import { track, trackUiClick } from "@/lib/track";
import { CopySwap } from "@/components/CopySwap";

export function ChecklistCapture({
  source = "homepage_checklist",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    trackUiClick("checklist_submit", { source });
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
        track("checklist_error", { source });
        return;
      }
      setStatus("ok");
      setMessage(
        data.message ||
          "Check your inbox for the Product Monetization Checkup."
      );
      track("checklist_signup", { source });
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again in a moment.");
    }
  }

  return (
    <div
      id={compact ? undefined : "checklist"}
      className={
        compact
          ? "text-left"
          : "scroll-mt-24 rounded-2xl border border-aqua/25 bg-gradient-to-br from-aqua/10 via-night-800/90 to-night-800/90 px-5 py-6 text-left sm:px-6"
      }
    >
      {!compact && (
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
          Free checkup (email)
        </p>
      )}
      <h2
        className={
          compact
            ? "text-base font-bold text-white"
            : "mt-2 text-xl font-bold text-white sm:text-2xl"
        }
      >
        <CopySwap
          mobile="10-question monetization checkup"
          desktop="Get the 10-question Product Monetization Checkup."
        />
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        <CopySwap
          mobile={
            <>
              Pre-flight for buyers, pricing, and launch. Prefer the{" "}
              <a
                href="/signup"
                className="font-semibold text-aqua hover:text-aqua-bright"
              >
                free playbook
              </a>{" "}
              in-app for more.
            </>
          }
          desktop={
            <>
              A sharp pre-flight list for buyers, pricing, and launch. Most
              founders still get more from the{" "}
              <a
                href="/signup"
                className="font-semibold text-aqua hover:text-aqua-bright"
              >
                free tailored playbook
              </a>{" "}
              inside the app. This checkup is the lighter on-ramp.
            </>
          }
        />
      </p>
      {status === "ok" ? (
        <p className="mt-4 rounded-xl border border-aqua/30 bg-aqua/10 px-4 py-3 text-sm font-medium text-aqua-bright">
          {message}
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch"
        >
          <label className="sr-only" htmlFor="checklist-email">
            Email
          </label>
          <input
            id="checklist-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-night-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none ring-aqua/40 focus:ring-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary whitespace-nowrap !px-5 !py-3 text-sm disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Email me the checkup"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-300">{message}</p>
      )}
      <p className="mt-3 text-xs text-slate-500">
        <CopySwap
          mobile="No spam. Unsubscribe anytime."
          desktop="No spam. You get the checkup now, then four short follow-ups over about a week. Every email includes an unsubscribe link."
        />
      </p>
    </div>
  );
}
