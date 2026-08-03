"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackUiClick } from "@/lib/track";

type Props = ComponentProps<typeof Link> & {
  /** Counter label, e.g. hero_cta_signup */
  trackTarget: string;
};

/** Link that also fires a ui_click for the founder Counter. */
export function TrackedLink({ trackTarget, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackUiClick(trackTarget, {
          href: typeof props.href === "string" ? props.href : undefined,
        });
        onClick?.(e);
      }}
    />
  );
}
