"use client";

import { useCallback, useState } from "react";
import { FullReportModal } from "@/components/FullReportModal";
import { ToolResultShell } from "@/components/ToolResultShell";
import { assembleFullBriefPayload } from "@/lib/build-full-brief";
import type { FounderBriefExtras } from "@/lib/founder-brief-extras";
import type { SharedReportPayload, ToolMemo } from "@/lib/shared-report";
import type { ProductContext } from "@/lib/product-context";
import type {
  BuyerStressTestResult,
  IdeaAnalysis,
  PricingRecommendation,
} from "@/types";

type BriefBundle = {
  product: ProductContext;
  analysis?: IdeaAnalysis | null;
  pricing?: PricingRecommendation | null;
  stress_test?: BuyerStressTestResult | null;
  tool_memo?: ToolMemo | null;
  cover_note?: string | null;
};

/**
 * Hooks Executive Brief + Full Report modal + share for any tool result.
 */
export function useFullBrief(bundle: BriefBundle) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SharedReportPayload | null>(null);
  const [extras, setExtras] = useState<FounderBriefExtras | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const title = `Monetization Brief: ${bundle.product.title}`;

  const ensurePayload = useCallback(
    async (opts?: { enrich?: boolean }) => {
      if (payload && extras && opts?.enrich !== true) return payload;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports/full-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: bundle.product,
            analysis: bundle.analysis,
            pricing: bundle.pricing,
            stress_test: bundle.stress_test,
            tool_memo: bundle.tool_memo,
            extras,
            cover_note: bundle.cover_note,
            enrich: opts?.enrich !== false,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not build full report");
        setPayload(data.payload);
        if (data.extras) setExtras(data.extras);
        return data.payload as SharedReportPayload;
      } catch (err) {
        // Fallback: local assemble without extras
        const fallback = assembleFullBriefPayload({
          product: bundle.product,
          analysis: bundle.analysis,
          pricing: bundle.pricing,
          stress_test: bundle.stress_test,
          tool_memo: bundle.tool_memo,
          extras,
          cover_note: bundle.cover_note,
        });
        setPayload(fallback);
        setError(
          err instanceof Error
            ? `${err.message} Showing core brief without operator extras.`
            : "Showing core brief without operator extras."
        );
        return fallback;
      } finally {
        setLoading(false);
      }
    },
    [bundle, extras, payload]
  );

  const openFullReport = useCallback(async () => {
    setOpen(true);
    await ensurePayload({ enrich: true });
  }, [ensurePayload]);

  const createShare = useCallback(async () => {
    setSharing(true);
    setError(null);
    try {
      const ready =
        payload ||
        (await ensurePayload({ enrich: true }));
      const res = await fetch("/api/reports/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: ready.product,
          analysis: ready.analysis,
          pricing: ready.pricing,
          stress_test: ready.stress_test,
          tool_memo: ready.tool_memo,
          extras: ready.extras,
          product_blurb: ready.product_blurb,
          cover_note: ready.cover_note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create share link");
      const url = String(data.shareUrl || "").replace(
        /MakeItRainApp\.com/i,
        "makeitrainapp.com"
      );
      setShareUrl(url);
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Share failed");
      return null;
    } finally {
      setSharing(false);
    }
  }, [ensurePayload, payload]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link");
    }
  }, [shareUrl]);

  return {
    open,
    setOpen,
    loading,
    sharing,
    error,
    payload,
    shareUrl,
    copied,
    title,
    openFullReport,
    createShare,
    copyLink,
    modalProps: {
      open,
      onClose: () => setOpen(false),
      payload,
      title,
      shareUrl,
      loading,
      error,
      onShare: () => void createShare(),
      sharing,
      copied,
      onCopyLink: () => void copyLink(),
    },
  };
}

export function FullBriefControls({
  executive,
  bundle,
  children,
}: {
  executive: React.ReactNode;
  bundle: BriefBundle;
  children?: React.ReactNode;
}) {
  const brief = useFullBrief(bundle);
  return (
    <>
      <ToolResultShell
        executive={executive}
        onViewFullReport={() => void brief.openFullReport()}
        onShare={() => {
          void (async () => {
            await brief.openFullReport();
            await brief.createShare();
          })();
        }}
        fullReportLoading={brief.loading}
      >
        {children}
      </ToolResultShell>
      <FullReportModal {...brief.modalProps} />
    </>
  );
}
