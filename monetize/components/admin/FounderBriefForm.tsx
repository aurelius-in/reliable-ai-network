"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { AdminOpsNav } from "@/components/admin/AdminOpsNav";

type BriefResult = {
  shareUrl: string;
  token: string;
  title: string;
  status?: string;
  summary: {
    score?: number;
    confidence?: string;
    primary_buyer?: string;
    smallest_paid_offer?: string;
    big_promise?: string;
    stress_verdict?: string;
    survival_score?: number;
    verdict_line?: string;
    who_may_pay?: string;
    dm_opener?: string;
  } | null;
};

function normalizeShareUrl(url: string) {
  return url.replace(/^https:\/\/MakeItRainApp\.com/i, "https://makeitrainapp.com");
}

export function FounderBriefForm({ adminKey }: { adminKey: string }) {
  const [url, setUrl] = useState("");
  const [founderName, setFounderName] = useState("");
  const [productName, setProductName] = useState("");
  const [traction, setTraction] = useState(
    "Founder-reported: free users or early usage; limited or no paying customers yet."
  );
  const [price, setPrice] = useState("");
  const [stage, setStage] = useState("launched");
  const [audience, setAudience] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BriefResult | null>(null);
  const [copied, setCopied] = useState<"url" | "dm" | null>(null);
  const pollRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  function stopTimers() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  async function pollUntilReady(token: string, shareUrl: string, title: string) {
    setPhase("Running Analyzer + Buyer Stress Test in the background…");
    const started = Date.now();
    tickRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);

    const pollOnce = async () => {
      const res = await fetch(
        `/api/admin/founder-brief?token=${encodeURIComponent(token)}`,
        { headers: { Authorization: `Bearer ${adminKey}` } }
      );
      const text = await res.text();
      let data: BriefResult & { error?: string; status?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Bad poll response (${res.status}). Try opening the brief link anyway.`
        );
      }
      if (!res.ok) throw new Error(data.error || "Poll failed");

      if (data.status === "failed") {
        throw new Error(data.error || "Brief generation failed");
      }
      if (data.status === "ready") {
        stopTimers();
        setResult({
          shareUrl: normalizeShareUrl(data.shareUrl || shareUrl),
          token,
          title: data.title || title,
          status: "ready",
          summary: data.summary,
        });
        setBusy(false);
        setPhase(null);
        return true;
      }
      setPhase(
        `Still generating… ${Math.floor((Date.now() - started) / 1000)}s (usually 2-3 min)`
      );
      return false;
    };

    // Immediate poll + interval
    if (await pollOnce()) return;
    pollRef.current = window.setInterval(() => {
      void pollOnce().catch((err) => {
        stopTimers();
        setBusy(false);
        setPhase(null);
        setError(err instanceof Error ? err.message : "Poll failed");
      });
    }, 4000);

    // Hard stop after 5 minutes
    window.setTimeout(() => {
      if (!pollRef.current) return;
      stopTimers();
      setBusy(false);
      setPhase(null);
      setError(
        "Timed out waiting for the brief. Open the /r/ link below; it may still finish loading."
      );
    }, 5 * 60 * 1000);
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    stopTimers();
    setBusy(true);
    setError(null);
    setResult(null);
    setElapsed(0);
    setPhase("Scraping URL and creating /r/ page…");
    try {
      const res = await fetch("/api/admin/founder-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          founderName: founderName.trim() || "Founder",
          productName: productName.trim() || undefined,
          traction: traction.trim() || undefined,
          price: price.trim() || undefined,
          stage,
          audience: audience.trim() || undefined,
        }),
      });
      const text = await res.text();
      let data: BriefResult & { error?: string; message?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned non-JSON (${res.status}). The run may have timed out on an old sync path. Refresh and try again.`
        );
      }
      if (!res.ok) throw new Error(data.error || "Generate failed");

      const shareUrl = normalizeShareUrl(data.shareUrl);
      setResult({
        shareUrl,
        token: data.token,
        title: data.title,
        status: data.status || "generating",
        summary: data.summary ?? null,
      });

      if (data.status === "ready") {
        setBusy(false);
        setPhase(null);
        return;
      }

      await pollUntilReady(data.token, shareUrl, data.title);
    } catch (err) {
      stopTimers();
      setBusy(false);
      setPhase(null);
      setError(err instanceof Error ? err.message : "Generate failed");
    }
  }

  function dmPaste(r: BriefResult): string {
    const s = r.summary || {};
    const name = founderName.trim() || "there";
    const lines = [
      `${name} - ran First Customer Path on ${url.trim()} (Analyzer + Buyer Stress Test).`,
      "",
      "Brief here (open / Print to PDF if useful):",
      normalizeShareUrl(r.shareUrl),
      "",
      `Short version: ${s.primary_buyer || s.who_may_pay || "see brief for who may pay"}. Paid wedge: ${s.smallest_paid_offer || "see brief"}.`,
      "",
      `Stress test: ${s.stress_verdict || "see brief"}${s.survival_score ? ` (${s.survival_score}/10)` : ""}. ${s.verdict_line || ""}`.trim(),
      "",
      "If you want, I'll draft the exact message to free users or your warm list next.",
    ];
    return lines.join("\n").replace(/\u2014/g, " - ").replace(/\u2013/g, "-");
  }

  async function copy(kind: "url" | "dm", text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <AdminOpsNav adminKey={adminKey} current="brief" />

      <form
        onSubmit={generate}
        className="rounded-2xl border border-night-600 bg-night-800 p-6 space-y-4"
      >
        <div>
          <h1 className="text-xl font-bold text-white">Founder Brief</h1>
          <p className="mt-1 text-sm text-slate-400">
            Paste a product URL. Creates a public /r/ brief like Ali&apos;s
            (Analyzer + Buyer Stress Test + extras). The share link appears in
            seconds; full analysis finishes in about 2-3 minutes.
          </p>
        </div>

        <label className="block text-sm">
          <span className="text-slate-300">Product URL *</span>
          <input
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://theirproduct.com"
            className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white placeholder:text-slate-600"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">Founder name</span>
            <input
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              placeholder="Ali Nawaz"
              className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white placeholder:text-slate-600"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">Product name</span>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="PetVax"
              className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white placeholder:text-slate-600"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-300">Stage</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white"
            >
              <option value="idea">Idea</option>
              <option value="building">Building</option>
              <option value="beta">Beta</option>
              <option value="launched">Launched</option>
              <option value="revenue">Has revenue</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">Price / packaging</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Free + Plus paid"
              className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white placeholder:text-slate-600"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-slate-300">Traction (founder-reported)</span>
          <textarea
            value={traction}
            onChange={(e) => setTraction(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white placeholder:text-slate-600"
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-300">Audience hint (optional)</span>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Who you think may pay"
            className="mt-1 w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-white placeholder:text-slate-600"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        {phase && (
          <p className="rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-sm text-slate-300">
            <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" />
            {phase}
            {elapsed > 0 ? ` (${elapsed}s)` : ""}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !url.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-rain-bright px-4 py-2.5 text-sm font-semibold text-night-950 disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            "Generate brief"
          )}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl border border-emerald-500/30 bg-night-800 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {result.status === "ready" ? "Ready" : "Link created · analyzing…"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {result.title}
            </h2>
            <p className="mt-1 break-all text-sm text-rain-bright">
              {normalizeShareUrl(result.shareUrl)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={normalizeShareUrl(result.shareUrl)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-sm text-rain-bright hover:border-rain-bright"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open brief
            </a>
            <button
              type="button"
              onClick={() => copy("url", normalizeShareUrl(result.shareUrl))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-sm text-white"
            >
              {copied === "url" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy URL
            </button>
            {result.status === "ready" && result.summary && (
              <button
                type="button"
                onClick={() => copy("dm", dmPaste(result))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-sm text-white"
              >
                {copied === "dm" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy DM
              </button>
            )}
          </div>

          {result.status === "ready" && result.summary && (
            <>
              <dl className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Score</dt>
                  <dd className="text-white">
                    {result.summary.score ?? "-"}/10 ·{" "}
                    {result.summary.confidence || "n/a"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Stress</dt>
                  <dd className="capitalize text-white">
                    {result.summary.stress_verdict} ·{" "}
                    {result.summary.survival_score}/10
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Who may pay</dt>
                  <dd className="text-white">
                    {result.summary.primary_buyer || result.summary.who_may_pay}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Smallest paid offer</dt>
                  <dd className="text-white">
                    {result.summary.smallest_paid_offer}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Verdict line</dt>
                  <dd className="text-white">{result.summary.verdict_line}</dd>
                </div>
              </dl>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-night-600 bg-night-950 p-3 text-xs text-slate-300">
                {dmPaste(result)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
