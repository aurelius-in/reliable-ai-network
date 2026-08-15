"use client";

import { useEffect } from "react";
import { Check, Link2, Loader2, Printer, X } from "lucide-react";
import { ProfessionalReportView } from "@/components/ProfessionalReportView";
import type { SharedReportPayload } from "@/lib/shared-report";

/**
 * Aesthetic Full Report overlay (Founder Brief canvas).
 */
export function FullReportModal({
  open,
  onClose,
  payload,
  title,
  shareUrl,
  loading,
  error,
  onShare,
  sharing,
  copied,
  onCopyLink,
}: {
  open: boolean;
  onClose: () => void;
  payload: SharedReportPayload | null;
  title: string;
  shareUrl?: string | null;
  loading?: boolean;
  error?: string | null;
  onShare?: () => void;
  sharing?: boolean;
  copied?: boolean;
  onCopyLink?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-[#f4f2ee] shadow-2xl sm:h-[min(92vh,980px)] sm:rounded-2xl">
        <div className="no-print flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-[#f4f2ee] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            Full Monetization Brief
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {payload && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Printer size={14} />
                Print / PDF
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                disabled={sharing}
                className="inline-flex items-center gap-1.5 rounded border border-stone-900 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
              >
                {sharing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Link2 size={14} />
                )}
                {shareUrl ? "Refresh link" : "Create share link"}
              </button>
            )}
            {shareUrl && onCopyLink && (
              <button
                type="button"
                onClick={onCopyLink}
                className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800"
              >
                {copied ? <Check size={14} /> : <Link2 size={14} />}
                {copied ? "Copied" : "Copy link"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {shareUrl && (
          <div className="no-print border-b border-stone-200 bg-white px-4 py-2">
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-xs font-medium text-stone-700 underline-offset-2 hover:underline"
            >
              {shareUrl}
            </a>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-stone-600">
              <Loader2 className="h-8 w-8 animate-spin text-stone-800" />
              <p className="text-sm font-medium">Building full report…</p>
              <p className="text-xs text-stone-500">
                Adding operator analysis (usually under a minute).
              </p>
            </div>
          )}
          {error && !loading && (
            <div className="px-6 py-10 text-center text-sm text-red-700">
              {error}
            </div>
          )}
          {!loading && payload && (
            <div className="report-shell text-stone-900">
              <ProfessionalReportView payload={payload} title={title} />
              <style>{`
                .report-shell { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
                .report-doc .font-serif, .report-doc h1, .report-doc h2, .report-doc blockquote {
                  font-family: Georgia, 'Times New Roman', serif;
                }
                @media print {
                  body * { visibility: hidden !important; }
                  .report-shell, .report-shell * { visibility: visible !important; }
                  .report-shell { position: absolute; left: 0; top: 0; width: 100%; background: white; }
                  .no-print { display: none !important; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
