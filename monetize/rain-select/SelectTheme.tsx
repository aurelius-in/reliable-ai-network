"use client";

import { useEffect } from "react";

/** Black, silver, no MIR magenta/cyan wash. */
export function SelectTheme() {
  useEffect(() => {
    document.documentElement.classList.add("select-site");
    return () => document.documentElement.classList.remove("select-site");
  }, []);
  return null;
}
