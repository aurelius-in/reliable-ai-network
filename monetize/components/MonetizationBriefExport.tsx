"use client";

import { useState } from "react";
import { Check, Link2, Loader2, Mail } from "lucide-react";
import { DownloadButton, ErrorText } from "@/components/ui";
import { TermHint } from "@/components/TermHint";
import { buildMonetizationBriefMd } from "@/lib/monetization-brief";
import type { ProductContext } from "@/lib/product-context";
import type { IdeaAnalysis, PricingRecommendation } from "@/types";

export function MonetizationBriefExport({
  product,
  analysis,
  pricing,
}: {
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
}) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailed, setEmailed] = useState(false);

  if (!analysis && !pricing) return null;

  const slug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const content = buildMonetizationBriefMd({ product, analysis, pricing });

  async function createShare(withEmail: boolean) {
    setLoading(true);
    setError(null);
    setEmailed(false);
    try {
      const res = await fetch("/api/reports/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          analysis,
          pricing,
          ...(withEmail && emailTo.trim() ? { emailTo: emailTo.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create share link");
      setShareUrl(data.shareUrl);
      setEmailed(Boolean(data.emailed));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link");
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-night-600 bg-night-800/80 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            <TermHint id="monetization_brief">Monetization Brief</TermHint>
          </p>
          <p className="text-xs text-slate-400">
            Professional memo: download, share a private link, or email it.
          </p>
        </div>
        <DownloadButton
          filename={`${slug || "product"}-monetization-brief.md`}
          content={content}
          label="Download .md"
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Email brief (optional)
          </label>
          <input
            type="email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="advisor@company.com"
            className="input-dark !py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => createShare(Boolean(emailTo.trim()))}
          className="btn-secondary inline-flex items-center gap-2 !px-3 !py-2 text-xs"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : emailTo.trim() ? (
            <Mail size={14} />
          ) : (
            <Link2 size={14} />
          )}
          {emailTo.trim() ? "Share link + email" : "Create share link"}
        </button>
      </div>

      {shareUrl && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-xs font-medium text-emerald-300 underline-offset-2 hover:underline"
          >
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1 rounded border border-emerald-500/40 px-2 py-1 text-[11px] font-semibold text-emerald-200"
          >
            {copied ? <Check size={12} /> : null}
            {copied ? "Copied" : "Copy"}
          </button>
          {emailed && (
            <span className="text-[11px] text-emerald-300/80">Email sent</span>
          )}
        </div>
      )}
      <ErrorText message={error} />
    </div>
  );
}
