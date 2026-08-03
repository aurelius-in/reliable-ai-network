"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareQuote } from "lucide-react";
import { track } from "@/lib/track";
import {
  formatReviewByline,
  REVIEW_RESPONSE_LABEL,
  type PublicReview,
} from "@/lib/reviews";

export function ReviewsPanel({
  showForm = true,
  formId = "leave-review",
}: {
  showForm?: boolean;
  formId?: string;
}) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (res.ok) setReviews(data.reviews ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    track("review_form_submit");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, companyName, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit");
      setSuccess(
        "Thanks. Your review is visible to you now. It appears for everyone after we publish it."
      );
      setAuthorName("");
      setCompanyName("");
      setBody("");
      // Reload so seeds shrink by one for this visitor.
      setLoading(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-10">
      {showForm && (
        <section
          id={formId}
          className="scroll-mt-24 rounded-2xl border border-night-600 bg-night-800/80 p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <MessageSquareQuote size={20} className="text-aqua" />
            Leave a review
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            No stars needed. Just tell others what stood out. You will see your
            review below right away; everyone else sees it after we publish it.
          </p>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                Your First and Last Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your First and Last Name"
                maxLength={80}
                required
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                Your Company or App
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company or App"
                maxLength={80}
                required
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                Your review
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What should other founders know?"
                rows={5}
                maxLength={2000}
                required
                className="input-dark w-full resize-y"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Submit review
            </button>
            {error && <p className="text-sm text-red-300">{error}</p>}
            {success && <p className="text-sm text-aqua-bright">{success}</p>}
          </form>
        </section>
      )}

      <section>
        <h2 className="text-lg font-black text-white">Reviews</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No published reviews yet. Be the first. Use the form above.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className={`rounded-2xl border p-5 ${
                  r.pendingPreview
                    ? "border-aqua/40 bg-aqua/5"
                    : "border-night-600 bg-night-800/60"
                }`}
              >
                {r.pendingPreview && (
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-aqua">
                    Your review · awaiting publish
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                  {r.body}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  {formatReviewByline(r.authorName, r.companyName)}
                </p>
                {r.response ? (
                  <div className="mt-4 ml-4 border-l-2 border-aqua/40 pl-4 sm:ml-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-aqua">
                      {REVIEW_RESPONSE_LABEL}
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                      {r.response}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
