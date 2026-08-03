"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareHeart } from "lucide-react";
import { trackUiClick } from "@/lib/track";
import { isComplimentaryStatus } from "@/lib/access-codes";

const DISMISS_KEY = "rain_reviewer_feedback_dismissed";

/** Prominent feedback CTA for complimentary reviewer accounts. */
export function ReviewerFeedbackBanner({
  subscriptionStatus,
}: {
  subscriptionStatus: string | null | undefined;
}) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!isComplimentaryStatus(subscriptionStatus)) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setHidden(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setHidden(false);
  }, [subscriptionStatus]);

  useEffect(() => {
    if (!isComplimentaryStatus(subscriptionStatus) || hidden) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      try {
        if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
      } catch {
        /* ignore */
      }
      e.preventDefault();
      e.returnValue = "";
      trackUiClick("reviewer_feedback_beforeunload");
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [subscriptionStatus, hidden]);

  if (!isComplimentaryStatus(subscriptionStatus) || hidden) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
    trackUiClick("reviewer_feedback_later");
  }

  return (
    <div className="fade-up rounded-2xl border border-rain/40 bg-gradient-to-br from-rain/15 to-night-800 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <MessageSquareHeart
            className="mt-0.5 shrink-0 text-rain-bright"
            size={22}
          />
          <div>
            <p className="text-sm font-bold text-white">
              Two minutes of honest feedback helps more than a polite silence
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Oliver invited you for judgment on rigor: does this guide
              evidence-based decisions, or polished output without enough
              teeth? Positive, negative, and neutral all help.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-stretch">
          <Link
            href="/reviews"
            onClick={() => trackUiClick("reviewer_leave_feedback")}
            className="btn-primary inline-flex items-center justify-center !px-5 !py-2.5 text-sm"
          >
            Leave feedback
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-semibold text-slate-500 hover:text-slate-300"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
