"use client";

import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import {
  savePendingProductUrl,
  type PendingTeaser,
} from "@/lib/pending-product-url";
import { track } from "@/lib/track";

const ROWS: { key: keyof PendingTeaser; label: string }[] = [
  { key: "likely_buyer", label: "Likely buyer" },
  { key: "unproven_assumption", label: "Biggest unproven assumption" },
  { key: "price_hypothesis", label: "Price hypothesis" },
  { key: "next_conversation", label: "Next conversation" },
];

export function HomeTeaserCard({
  teaser,
  signupHref,
}: {
  teaser: PendingTeaser;
  signupHref: string;
}) {
  return (
    <div className="mt-5 w-full max-w-xl rounded-2xl border border-aqua/35 bg-night-800/90 p-4 text-left sm:p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-aqua">
        Commercial result · hypothesis
      </p>
      <p className="mt-1 text-sm font-semibold text-white">
        {teaser.product_name}
      </p>
      <dl className="mt-3 space-y-3">
        {ROWS.map((row) => (
          <div key={row.key}>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-slate-200">
              {teaser[row.key]}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm font-semibold text-white">
        Want the full First Customer Path? Save this product.
      </p>
      <TrackedLink
        href={signupHref}
        trackTarget="home_teaser_save"
        onClick={() => {
          savePendingProductUrl(teaser.url);
          track("home_teaser_save");
        }}
        className="btn-primary glow-card mt-3 inline-flex w-full items-center justify-center gap-2 !px-6 !py-3.5 text-base sm:w-auto"
      >
        Save this product <ArrowRight size={18} />
      </TrackedLink>
      <p className="mt-2 text-xs text-slate-500">
        Grounded in the public page. Argue with it. The full path is the brief:
        Stress Test, ranked conversations, drafts you approve.
      </p>
    </div>
  );
}
