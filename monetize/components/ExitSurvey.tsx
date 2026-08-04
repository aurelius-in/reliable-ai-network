"use client";

import { useEffect, useState } from "react";
import { readHomeAbFromDocument } from "@/lib/home-ab";
import { trackUiClick } from "@/lib/track";

const OPTIONS: { id: string; label: string }[] = [
  { id: "unclear_outcome", label: "I did not understand what I would receive." },
  { id: "unsure_why_signup", label: "I was unsure why I was asked to sign up." },
  { id: "distrust_link", label: "I did not trust the access link." },
  { id: "no_product_info", label: "I did not want to provide product information." },
  { id: "wanted_sample", label: "I expected a sample first." },
  { id: "not_ready_time", label: "I was not ready to spend the time." },
  { id: "other", label: "Other." },
];

const DISMISS_KEY = "rain_exit_survey_done";

/**
 * Soft exit survey: shows after ~25s on invite/signup/sample if still logged out,
 * or when reviewer clicks "Not now" on the feedback banner.
 */
export function ExitSurvey({
  open: openProp,
  onClose,
  source = "auto",
}: {
  open?: boolean;
  onClose?: () => void;
  source?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (typeof openProp === "boolean") {
      setOpen(openProp);
      return;
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }
    const path = window.location.pathname;
    if (
      !path.startsWith("/invite") &&
      path !== "/signup" &&
      path !== "/sample"
    ) {
      return;
    }
    const t = window.setTimeout(() => {
      setOpen(true);
      const homeAb = readHomeAbFromDocument();
      trackUiClick("exit_survey_shown", {
        source: "timer",
        path,
        ...(homeAb ? { home_ab: homeAb } : {}),
      });
    }, 25000);
    return () => window.clearTimeout(t);
  }, [openProp]);

  async function submit() {
    if (!reason) return;
    setSending(true);
    const homeAb = readHomeAbFromDocument();
    try {
      await fetch("/api/exit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          detail: reason === "other" ? detail : undefined,
          path: window.location.pathname,
          source,
          home_ab: homeAb ?? undefined,
        }),
      });
      trackUiClick("exit_survey_submit", {
        reason,
        source,
        ...(homeAb ? { home_ab: homeAb } : {}),
      });
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* ignore */
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  function close() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    onClose?.();
    trackUiClick("exit_survey_dismiss");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:max-w-md">
      <div className="rounded-2xl border border-white/15 bg-night-800 p-5 shadow-2xl shadow-black/50">
        {sent ? (
          <>
            <p className="text-sm font-bold text-white">Thanks. That helps.</p>
            <button
              type="button"
              onClick={close}
              className="mt-3 text-sm font-semibold text-aqua hover:text-aqua-bright"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-white">
              What stopped you from continuing?
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Optional. One tap helps us fix trust and clarity.
            </p>
            <ul className="mt-3 space-y-1.5">
              {OPTIONS.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setReason(o.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                      reason === o.id
                        ? "border-aqua/50 bg-aqua/10 text-white"
                        : "border-white/10 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))}
            </ul>
            {reason === "other" && (
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Optional detail"
                className="mt-2 w-full rounded-lg border border-white/15 bg-night-900 px-3 py-2 text-xs text-white"
                rows={2}
              />
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={!reason || sending}
                onClick={() => void submit()}
                className="btn-primary flex-1 !px-3 !py-2 text-xs disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Not now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
