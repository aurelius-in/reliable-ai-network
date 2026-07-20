"use client";

import { useState } from "react";
import { CopyButton, DownloadButton } from "@/components/ui";
import { QUICK_START_TEMPLATES } from "@/lib/templates";

/**
 * Tab 3 — Quick-Start Library (Starter).
 * Battle-tested templates: preview, copy, download, ship today.
 */
export function LibraryTab() {
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="text-lg font-bold text-white">Quick-Start Library</h2>
        <p className="helper-text">
          Proven templates with [BRACKETS] where your product goes. Download
          one, fill in the brackets, and publish today — no writing skills
          needed.
        </p>
      </div>

      {QUICK_START_TEMPLATES.map((template) => (
        <div key={template.id} className="card overflow-hidden">
          <div className="space-y-3 p-5">
            <div>
              <h3 className="font-bold text-white">{template.title}</h3>
              <p className="mt-0.5 text-sm text-slate-400">
                {template.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setPreviewId(previewId === template.id ? null : template.id)
                }
                className="rounded-lg border border-night-600 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-rain/50"
              >
                {previewId === template.id ? "Hide" : "Preview"}
              </button>
              <CopyButton text={template.content} label="Copy" />
              <DownloadButton
                filename={template.filename}
                content={template.content}
              />
            </div>
          </div>
          {previewId === template.id && (
            <pre className="max-h-96 overflow-auto border-t border-night-600 bg-night-800/70 p-5 text-xs leading-relaxed whitespace-pre-wrap text-slate-300">
              {template.content}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
