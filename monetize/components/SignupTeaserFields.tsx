"use client";

import { useEffect, useState } from "react";
import { readPendingTeaser, type PendingTeaser } from "@/lib/pending-product-url";

const ROWS: { key: keyof PendingTeaser; label: string }[] = [
  { key: "likely_buyer", label: "Likely buyer" },
  { key: "unproven_assumption", label: "Biggest unproven assumption" },
  { key: "price_hypothesis", label: "Price hypothesis" },
  { key: "next_conversation", label: "Next conversation" },
];

export function SignupTeaserFields() {
  const [teaser, setTeaser] = useState<PendingTeaser | null>(null);

  useEffect(() => {
    setTeaser(readPendingTeaser());
  }, []);

  if (!teaser) return null;

  return (
    <dl className="mb-5 space-y-2.5 rounded-xl border border-aqua/25 bg-aqua/5 px-3 py-3">
      {ROWS.map((row) => (
        <div key={row.key}>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-aqua">
            {row.label}
          </dt>
          <dd className="mt-0.5 text-sm leading-snug text-slate-200">
            {teaser[row.key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
