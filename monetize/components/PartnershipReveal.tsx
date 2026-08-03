"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Plays the RAIN × IMS join clip, then fades to the Make it RAIN logo.
 */
export function PartnershipReveal() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* autoplay may be blocked; muted playsInline usually works */
      });
    }
  }, []);

  const finishToLogo = () => setShowLogo(true);

  return (
    <div className="relative mx-auto mt-4 flex h-36 w-full max-w-[9.5rem] items-center justify-center sm:h-40 sm:max-w-[11rem]">
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
          showLogo ? "opacity-0" : "opacity-100"
        }`}
        src="/partners/electric.mp4"
        muted
        playsInline
        preload="auto"
        aria-label="Reliable AI Network and Innovative Marketing Solutions joining forces"
        onEnded={finishToLogo}
        onError={finishToLogo}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/partners/make-it-rain-logo.png"
        alt="Make it RAIN"
        className={`absolute inset-0 m-auto h-auto max-h-[72%] w-[88%] object-contain transition-opacity duration-700 ${
          showLogo ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
