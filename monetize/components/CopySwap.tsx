import type { ReactNode } from "react";

/** Shorter copy on mobile; fuller copy from `sm` up. */
export function CopySwap({
  mobile,
  desktop,
  className = "",
  block = false,
}: {
  mobile: ReactNode;
  desktop: ReactNode;
  className?: string;
  /** Block display (safe inside headings; uses span). */
  block?: boolean;
}) {
  const mobileVis = block ? "block sm:hidden" : "sm:hidden";
  const desktopVis = block ? "hidden sm:block" : "hidden sm:inline";
  return (
    <>
      <span className={`${mobileVis} ${className}`.trim()}>{mobile}</span>
      <span className={`${desktopVis} ${className}`.trim()}>{desktop}</span>
    </>
  );
}
