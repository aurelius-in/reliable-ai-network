"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Brief brand splash on tab changes. Navy plate matches app chrome.
 * Prefers the short mp4; falls back to the animated gif.
 */
export function BrandSplash({
  triggerKey,
  durationMs = 700,
}: {
  triggerKey: string;
  durationMs?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [useGif, setUseGif] = useState(false);
  const first = useRef(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    setVisible(true);
    setReady(false);
    setUseGif(false);

    const show = window.setTimeout(() => setReady(true), 20);
    const hide = window.setTimeout(() => setVisible(false), durationMs);

    const v = videoRef.current;
    if (v) {
      try {
        v.currentTime = 0;
        const play = v.play();
        if (play && typeof play.catch === "function") {
          play.catch(() => setUseGif(true));
        }
      } catch {
        setUseGif(true);
      }
    }

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [triggerKey, durationMs]);

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[70] flex items-center justify-center transition-opacity duration-200 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#070a12]/84" />
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.65rem] bg-[#070a12] shadow-[0_0_36px_rgba(0,229,255,0.2)] ring-1 ring-cyan-300/15 sm:h-32 sm:w-32">
        {!useGif ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/brand/splash.mp4"
            muted
            playsInline
            preload="auto"
            poster="/brand/mark.jpg"
            onError={() => setUseGif(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/brand/logo-anim.gif"
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
