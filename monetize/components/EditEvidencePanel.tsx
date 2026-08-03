"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { ErrorText, FieldLabel } from "@/components/ui";
import type { Creation } from "@/types";

/**
 * Edit URL / GitHub / docs on an existing product (post-create evidence).
 */
export function EditEvidencePanel({
  creation,
  onUpdated,
}: {
  creation: Creation;
  onUpdated: (creation: Creation) => void;
}) {
  const [open, setOpen] = useState(false);
  const [productUrl, setProductUrl] = useState(creation.product_url ?? "");
  const [githubUrl, setGithubUrl] = useState(creation.github_repo_url ?? "");
  const [traction, setTraction] = useState(creation.traction ?? "");
  const [competitors, setCompetitors] = useState(
    creation.competitors_notes ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(opts?: { fetchWebsite?: boolean; fetchGithub?: boolean }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/creations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: creation.id,
          product_url: productUrl.trim() || null,
          github_repo_url: githubUrl.trim() || null,
          traction: traction.trim() || null,
          competitors_notes: competitors.trim() || null,
          fetch_website: Boolean(opts?.fetchWebsite && productUrl.trim()),
          fetch_github: Boolean(opts?.fetchGithub && githubUrl.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.creation) {
        throw new Error(data.error ?? "Could not update evidence");
      }
      onUpdated(data.creation as Creation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("creationId", creation.id);
      form.set("file", file);
      const res = await fetch("/api/creations/evidence", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.creation) {
        throw new Error(data.error ?? "Upload failed");
      }
      onUpdated(data.creation as Creation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const docs = creation.evidence_docs ?? [];
  const hasSite = Boolean(creation.website_context);
  const hasGh = Boolean(creation.github_context);

  return (
    <div className="rounded-xl border border-night-600 bg-night-800/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-white">Evidence &amp; sources</p>
          <p className="text-xs text-slate-400">
            {hasSite ? "URL scraped · " : ""}
            {hasGh ? "GitHub pulled · " : ""}
            {docs.length} doc{docs.length === 1 ? "" : "s"}
            {!hasSite && !hasGh && docs.length === 0
              ? "Add URL, GitHub, or docs to harden this brief"
              : ""}
          </p>
        </div>
        <span className="text-aqua">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-night-600 px-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Product URL
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://yourproduct.com"
              className="input-dark"
            />
            <button
              type="button"
              disabled={loading || !productUrl.trim()}
              onClick={() => save({ fetchWebsite: true })}
              className="btn-secondary mt-2 inline-flex items-center gap-2 !px-3 !py-2 text-xs"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Save &amp; scrape page
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Public GitHub repo
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="input-dark"
            />
            <button
              type="button"
              disabled={loading || !githubUrl.trim()}
              onClick={() => save({ fetchGithub: true })}
              className="btn-secondary mt-2 inline-flex items-center gap-2 !px-3 !py-2 text-xs"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Save &amp; pull README
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Traction notes
            </label>
            <textarea
              rows={2}
              value={traction}
              onChange={(e) => setTraction(e.target.value)}
              className="input-dark"
              placeholder="Waitlist, pilots, MRR, design partners…"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white">
              Competitors / alternatives
            </label>
            <textarea
              rows={2}
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              className="input-dark"
              placeholder="Names separated by commas — Apollo enrich runs on analyze"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => save()}
            className="btn-primary !px-4 !py-2 text-xs"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Save notes
          </button>

          <div>
            <FieldLabel helper="Text or PDF. Max 5 files.">
              Upload evidence doc
            </FieldLabel>
            <label className="btn-secondary mt-1 inline-flex cursor-pointer items-center gap-2 !px-3 !py-2 text-xs">
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              Choose file
              <input
                type="file"
                accept=".txt,.md,.markdown,.csv,.json,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf"
                className="hidden"
                onChange={onFile}
                disabled={uploading}
              />
            </label>
            {docs.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {docs.map((d) => (
                  <li key={d.name}>
                    {d.name} · {d.text_excerpt.length} chars
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ErrorText message={error} />
        </div>
      )}
    </div>
  );
}
