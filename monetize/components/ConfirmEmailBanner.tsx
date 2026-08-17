"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/track";

const DISMISS_KEY = "rain_confirm_later_dismissed";

/**
 * Optional inbox check. Account already works. Do not use this as a gate.
 */
export function ConfirmEmailBanner() {
  const [email, setEmail] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user?.email) return;
      const meta = user.user_metadata ?? {};
      if (meta.inbox_verified === true) return;
      if (meta.confirm_later !== true) return;
      setEmail(user.email);
      setShow(true);
    });
  }, []);

  if (!show || !email) return null;

  async function resend() {
    if (!email) return;
    setLoading(true);
    setNote(null);
    try {
      const supabase = createClient();
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) throw error;
      track("confirm_later_resend");
      setNote("Sent. Check spam if it is not in the inbox.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not send that.");
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    track("confirm_later_dismiss");
    setShow(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-night-800/80 px-4 py-3 sm:px-5">
      <p className="text-sm text-slate-200">
        You can use the app now. Confirm{" "}
        <span className="font-semibold text-white">{email}</span> whenever you
        have a minute. It helps if you ever need to reset your password.
      </p>
      {note ? <p className="mt-2 text-xs text-aqua-bright">{note}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void resend()}
          disabled={loading}
          className="rounded-lg border border-aqua/40 bg-aqua/10 px-3 py-1.5 text-xs font-semibold text-aqua-bright hover:bg-aqua/20"
        >
          {loading ? <Loader2 size={12} className="inline animate-spin" /> : null}{" "}
          Send the link again
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          Later
        </button>
      </div>
    </div>
  );
}
