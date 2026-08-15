"use client";

import { FileText, Link2, Loader2 } from "lucide-react";

/**
 * Standard tool result chrome: Executive Brief always visible,
 * Full Report one click away.
 */
export function ToolResultShell({
  executive,
  onViewFullReport,
  onShare,
  fullReportLoading = false,
  children,
  className = "",
}: {
  executive: React.ReactNode;
  onViewFullReport?: () => void;
  onShare?: () => void;
  fullReportLoading?: boolean;
  /** Optional deeper dashboard sections below the CTAs */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-2xl border border-rain/35 bg-gradient-to-br from-rain/10 via-night-800 to-night-800 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rain-bright">
          Executive Brief
        </p>
        <div className="mt-3">{executive}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {onViewFullReport && (
            <button
              type="button"
              onClick={onViewFullReport}
              disabled={fullReportLoading}
              className="btn-primary inline-flex min-h-[44px] items-center gap-2 px-4 text-sm md:min-h-0"
            >
              {fullReportLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {fullReportLoading ? "Building full report…" : "View full report"}
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              disabled={fullReportLoading}
              className="btn-secondary inline-flex min-h-[44px] items-center gap-2 px-4 text-sm md:min-h-0"
            >
              <Link2 size={16} />
              Share brief
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Full report = comprehensive analysis, Print/PDF, same quality as a
          Founder Brief.
        </p>
      </div>
      {children}
    </div>
  );
}
