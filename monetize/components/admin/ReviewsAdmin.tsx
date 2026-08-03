"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SEED_REVIEWS } from "@/lib/review-seeds";
import {
  formatReviewByline,
  REVIEW_RESPONSE_LABEL,
  type ProductReviewRow,
} from "@/lib/reviews";

type EditState = {
  displayBody: string;
  authorName: string;
  companyName: string;
  founderResponse: string;
};

export function ReviewsAdmin({ adminKey }: { adminKey: string }) {
  const [reviews, setReviews] = useState<ProductReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, EditState>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/reviews?key=${encodeURIComponent(adminKey)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      const rows = (data.reviews ?? []) as ProductReviewRow[];
      setReviews(rows);
      const next: Record<string, EditState> = {};
      for (const r of rows) {
        next[r.id] = {
          displayBody: r.display_body ?? r.body,
          authorName: r.author_name,
          companyName: r.company_name ?? "",
          founderResponse: r.founder_response ?? "",
        };
      }
      setEdits(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(
    id: string,
    body: Record<string, unknown>
  ): Promise<void> {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string): Promise<void> {
    const ok = window.confirm(
      "Delete this review permanently? This cannot be undone."
    );
    if (!ok) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin" /> Loading reviews…
      </p>
    );
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");
  const rejected = reviews.filter((r) => r.status === "rejected");

  function editorProps(r: ProductReviewRow) {
    const edit = edits[r.id];
    return {
      row: r,
      busy: busyId === r.id,
      edit,
      onEditChange: (next: EditState) =>
        setEdits((prev) => ({ ...prev, [r.id]: next })),
      onApprove: () =>
        void patch(r.id, {
          status: "approved",
          displayBody: edit?.displayBody,
          authorName: edit?.authorName,
          companyName: edit?.companyName,
          founderResponse: edit?.founderResponse ?? "",
        }),
      onReject: () => void patch(r.id, { status: "rejected" }),
      onSaveEdit: () =>
        void patch(r.id, {
          displayBody: edit?.displayBody,
          authorName: edit?.authorName,
          companyName: edit?.companyName,
          founderResponse: edit?.founderResponse ?? "",
        }),
      onDelete: () => void remove(r.id),
    };
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-300">{error}</p>}
      <p className="text-sm text-slate-400">
        Add a {REVIEW_RESPONSE_LABEL} reply before or after you approve. Use
        Delete on any real review below (pending, approved, or rejected).
      </p>
      <p className="text-xs text-slate-500">
        The five filler reviews on the public page (Mei, Diego, Helen, Vikram,
        Leslie) are not in the database. They disappear automatically as you
        approve real reviews. There is nothing to delete for those.
      </p>

      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-amber-200">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No pending reviews.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {pending.map((r) => (
              <ReviewEditor key={r.id} {...editorProps(r)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-aqua">
            Approved ({approved.length})
          </h2>
          {approved.length > 0 && (
            <p className="text-xs text-slate-500">
              Delete here to remove a live public review
            </p>
          )}
        </div>
        {approved.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No approved reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {approved.map((r) => (
              <ReviewEditor key={r.id} {...editorProps(r)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
          Rejected ({rejected.length})
        </h2>
        {rejected.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No rejected reviews.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {rejected.map((r) => (
              <ReviewEditor key={r.id} {...editorProps(r)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">
          Public fillers (not stored · {SEED_REVIEWS.length})
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Shown on /reviews only until you have 5 approved real reviews. Not
          deletable here.
        </p>
        <ul className="mt-3 space-y-2">
          {SEED_REVIEWS.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-night-700 bg-night-900/50 px-3 py-2 text-xs text-slate-500"
            >
              {formatReviewByline(s.authorName, s.companyName)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReviewEditor({
  row,
  busy,
  edit,
  onEditChange,
  onApprove,
  onReject,
  onSaveEdit,
  onDelete,
}: {
  row: ProductReviewRow;
  busy: boolean;
  edit?: EditState;
  onEditChange: (next: EditState) => void;
  onApprove: () => void;
  onReject: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
}) {
  const base: EditState = {
    displayBody: edit?.displayBody ?? row.display_body ?? row.body,
    authorName: edit?.authorName ?? row.author_name,
    companyName: edit?.companyName ?? row.company_name ?? "",
    founderResponse: edit?.founderResponse ?? row.founder_response ?? "",
  };

  return (
    <li className="rounded-2xl border border-night-600 bg-night-800 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span
            className={
              row.status === "approved"
                ? "text-aqua"
                : row.status === "pending"
                  ? "text-amber-300"
                  : "text-red-300"
            }
          >
            {row.status}
          </span>
          <span>· {new Date(row.created_at).toLocaleString()}</span>
          <span className="font-mono text-[10px]">{row.id.slice(0, 8)}</span>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300 ring-1 ring-red-500/40 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Original</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">
        {row.body}
      </p>
      <label className="mt-3 block text-xs text-slate-500">
        First and last name
        <input
          className="input-dark mt-1 w-full"
          value={base.authorName}
          onChange={(e) =>
            onEditChange({ ...base, authorName: e.target.value })
          }
        />
      </label>
      <label className="mt-3 block text-xs text-slate-500">
        Company or app
        <input
          className="input-dark mt-1 w-full"
          value={base.companyName}
          onChange={(e) =>
            onEditChange({ ...base, companyName: e.target.value })
          }
        />
      </label>
      <label className="mt-3 block text-xs text-slate-500">
        Public text (edit before approve)
        <textarea
          className="input-dark mt-1 w-full resize-y"
          rows={4}
          value={base.displayBody}
          onChange={(e) =>
            onEditChange({ ...base, displayBody: e.target.value })
          }
        />
      </label>
      <label className="mt-3 block text-xs text-slate-500">
        {REVIEW_RESPONSE_LABEL} response (public, indented)
        <textarea
          className="input-dark mt-1 w-full resize-y"
          rows={3}
          placeholder="Thanks for the review..."
          value={base.founderResponse}
          onChange={(e) =>
            onEditChange({ ...base, founderResponse: e.target.value })
          }
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="rounded-lg bg-aqua/20 px-3 py-1.5 text-xs font-bold text-aqua-bright ring-1 ring-aqua/40 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onSaveEdit}
          className="rounded-lg border border-night-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Save edits
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </li>
  );
}
