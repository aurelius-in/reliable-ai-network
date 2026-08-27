"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RAIN_SELECT } from "./config";

export function SelectHeader() {
  const [home, setHome] = useState("/select");
  useEffect(() => {
    if (window.location.hostname.toLowerCase().includes("rainselect")) {
      setHome("/");
    }
  }, []);
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
      <Link href={home} className="flex items-center gap-3">
        <Image
          src="/rain-select-logo.png"
          alt="RAIN Select"
          width={180}
          height={72}
          priority
          className="h-10 w-auto sm:h-12"
        />
        <span className="sr-only">{RAIN_SELECT.brandName}</span>
      </Link>
      <a
        href="#apply"
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 transition hover:text-white"
      >
        Apply
      </a>
    </header>
  );
}

export function SelectFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-5xl border-t border-white/10 px-5 py-8 text-center text-xs text-zinc-500">
      <p>{RAIN_SELECT.companyLine}</p>
      <p className="mt-2">
        Reliable AI Network, LLC. RAIN Select is a commercial intervention, not
        a software membership.
      </p>
    </footer>
  );
}
