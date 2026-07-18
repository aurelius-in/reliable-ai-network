"use client";

import { useEffect, useState } from "react";
import { Share, SquarePlus, X } from "lucide-react";

const DISMISS_KEY = "rain-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari exposes navigator.standalone when launched from Home Screen.
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    if (isIOS) {
      setShowIOS(true);
      setHidden(false);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setHidden(true);
    }
    setInstallEvent(null);
  };

  if (hidden || (!installEvent && !showIOS)) return null;

  return (
    <div className="card fade-up relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
      <button
        onClick={dismiss}
        aria-label="Dismiss install hint"
        className="absolute right-3 top-3 text-slate-500 transition hover:text-white"
      >
        <X size={16} />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-rain/20 ring-1 ring-night-600"
      />

      <div className="min-w-0 flex-1 pr-6">
        <p className="text-sm font-bold text-white">
          Put RAIN Monetize on your home screen
        </p>
        {showIOS ? (
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-400">
            Tap
            <span className="chip !cursor-default !px-2 !py-0.5 !text-[11px]">
              <Share size={12} /> Share
            </span>
            then
            <span className="chip !cursor-default !px-2 !py-0.5 !text-[11px]">
              <SquarePlus size={12} /> Add to Home Screen
            </span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-400">
            Install the app for full-screen access to all 15 tools — no browser
            chrome, one tap from your home screen.
          </p>
        )}
      </div>

      {!showIOS && (
        <button
          onClick={install}
          className="btn-primary shrink-0 !px-4 !py-2 text-sm"
        >
          Install app
        </button>
      )}
    </div>
  );
}
