"use client";

import { useState } from "react";
import { Check, FileText, Link2, Loader2, Mail } from "lucide-react";
import { FullReportModal } from "@/components/FullReportModal";
import { DownloadButton, ErrorText } from "@/components/ui";
import { TermHint } from "@/components/TermHint";
import { assembleFullBriefPayload } from "@/lib/build-full-brief";
import { buildMonetizationBriefMd } from "@/lib/monetization-brief";
import type { FounderBriefExtras } from "@/lib/founder-brief-extras";
import type { ProductContext } from "@/lib/product-context";
import type { SharedReportPayload } from "@/lib/shared-report";
import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";

export function MonetizationBriefExport({
  product,
  analysis,
  pricing,
  stress_test,
}: {
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress_test?: BuyerStressTestResult | null;
}) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [payload, setPayload] = useState<SharedReportPayload | null>(null);
  const [extras, setExtras] = useState<FounderBriefExtras | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailed, setEmailed] = useState(false);

  if (!analysis && !pricing && !stress_test) return null;

  const slug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const content = buildMonetizationBriefMd({ product, analysis, pricing });
  const title = `Monetization Brief: ${product.title}`;

  async function ensureFullPayload() {
    if (payload && extras) return payload;
    setModalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/full-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          analysis,
          pricing,
          stress_test,
          extras,
          enrich: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not build full report");
      setPayload(data.payload);
      if (data.extras) setExtras(data.extras);
      return data.payload as SharedReportPayload;
    } catch (err) {
      const fallback = assembleFullBriefPayload({
        product,
        analysis,
        pricing,
        stress_test,
        extras,
      });
      setPayload(fallback);
      setError(
        err instanceof Error
          ? `${err.message} Showing core brief.`
          : "Showing core brief."
      );
      return fallback;
    } finally {
      setModalLoading(false);
    }
  }

  async function openFullReport() {
    setModalOpen(true);
    await ensureFullPayload();
  }

  async function createShare(withEmail: boolean) {
    setLoading(true);
    setError(null);
    setEmailed(false);
    try {
      const ready = await ensureFullPayload();
      const res = await fetch("/api/reports/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: ready.product,
          analysis: ready.analysis,
          pricing: ready.pricing,
          stress_test: ready.stress_test,
          extras: ready.extras,
          product_blurb: ready.product_blurb,
          cover_note: ready.cover_note,
          ...(withEmail && emailTo.trim() ? { emailTo: emailTo.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create share link");
      setShareUrl(
        String(data.shareUrl || "").replace(
          /MakeItRainApp\.com/i,
          "makeitrainapp.com"
        )
      );
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
            <TermHint id="monetization_brief">Full Monetization Brief</TermHint>
          </p>
          <p className="text-xs text-slate-400">
            Comprehensive report: open in-app, Print/PDF, or share a private
            link.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void openFullReport()}
            className="btn-primary inline-flex items-center gap-2 !px-3 !py-2 text-xs"
          >
            <FileText size={14} />
            Open full report
          </button>
          <DownloadButton
            filename={`${slug || "product"}-monetization-brief.md`}
            content={content}
            label="Download .md"
          />
        </div>
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

      <FullReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        payload={payload}
        title={title}
        shareUrl={shareUrl}
        loading={modalLoading}
        error={error}
        onShare={() => void createShare(false)}
        sharing={loading}
        copied={copied}
        onCopyLink={() => void copyLink()}
      />
    </div>
  );
}
