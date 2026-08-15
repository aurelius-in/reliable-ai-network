"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { CopyButton, DownloadButton, ErrorText } from "@/components/ui";
import { FullBriefControls } from "@/components/FullBriefControls";
import { ToolMemoExecutiveBrief } from "@/components/ExecutiveBrief";
import type { ProductContext } from "@/lib/product-context";
import type { ToolMemo } from "@/lib/shared-report";

export function BuyerProofPackPanel({
  creationId,
}: {
  creationId?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [memo, setMemo] = useState<ToolMemo | null>(null);
  const [product, setProduct] = useState<ProductContext | null>(null);

  async function build() {
    setLoading(true);
    setError(null);
    try {
      const qs = creationId
        ? `?creationId=${encodeURIComponent(creationId)}`
        : "";
      const res = await fetch(`/api/buyer-proof-pack${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not build proof pack");
      setMarkdown(data.markdown);
      setMemo(data.tool_memo);
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/10 via-night-800 to-night-800 p-5 sm:p-6">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-bright">
        Buyer Proof Pack
      </p>
      <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
        Forwardable justification after a serious conversation
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        Assembles problem, offer, price rationale, observed proof, risks, and
        next step from your latest Analyzer, Pricing, and Stress Test. No fake
        testimonials.
      </p>
      <button
        type="button"
        onClick={build}
        disabled={loading}
        className="btn-primary mt-4"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        {markdown ? "Rebuild proof pack" : "Build proof pack"}
      </button>
      <ErrorText message={error} />

      {markdown && memo && product && (
        <div className="mt-5">
          <FullBriefControls
            bundle={{
              product,
              tool_memo: memo,
              cover_note: `Buyer Proof Pack for ${product.title}.`,
            }}
            executive={<ToolMemoExecutiveBrief memo={memo} />}
          >
            <div className="rounded-xl border border-night-600 bg-night-800/80 p-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <CopyButton text={markdown} label="Copy markdown" />
                <DownloadButton
                  filename="buyer-proof-pack.md"
                  content={markdown}
                  label="Download"
                />
              </div>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                {markdown}
              </pre>
            </div>
          </FullBriefControls>
        </div>
      )}
    </div>
  );
}
