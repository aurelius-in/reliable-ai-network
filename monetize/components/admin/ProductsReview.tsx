import { AdminOpsNav } from "@/components/admin/AdminOpsNav";
import type { AdminProductSubmission } from "@/lib/admin-products";

const SOURCE_STYLE: Record<string, string> = {
  founder: "bg-sky-500/15 text-sky-200 ring-sky-500/30",
  observed: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
  system: "bg-amber-500/15 text-amber-100 ring-amber-500/30",
};

/**
 * Scannable founder view: user + question/answer rows for every product intake.
 */
export function ProductsReview({
  submissions,
  total,
  adminKey,
}: {
  submissions: AdminProductSubmission[];
  total: number;
  adminKey: string;
}) {
  return (
    <div className="w-full max-w-5xl space-y-6">
      <AdminOpsNav adminKey={adminKey} current="products" />

      <div className="text-center">
        <h1 className="text-2xl font-black text-white">Product submissions</h1>
        <p className="mt-1 text-sm text-slate-400">
          What founders entered · {submissions.length} shown
          {total > submissions.length ? ` of ${total}` : ""} · newest first
        </p>
        <p className="mt-2 text-xs text-slate-500">
          <span className="text-sky-300">Founder</span> = they typed it ·{" "}
          <span className="text-emerald-300">Observed</span> = scraped from URL
          / GitHub · Evidence checklist only appears on analyses after
          2026-08-08 persist.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-night-600 bg-night-800 p-8 text-center text-sm text-slate-400">
          No product creations yet.
        </div>
      ) : (
        <div className="space-y-5">
          {submissions.map((s) => (
            <article
              key={s.creationId}
              className="rounded-2xl border border-white/10 bg-night-800/90 p-5 sm:p-6"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-lg font-bold text-white">
                    {s.user.name?.trim() || "Unnamed"}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      · {s.user.email}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Tier: {s.user.tier ?? "free"}
                    {s.user.subscriptionStatus
                      ? ` · ${s.user.subscriptionStatus}`
                      : ""}{" "}
                    · Product saved{" "}
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="max-w-xs text-right text-sm font-semibold text-aqua-bright">
                  {s.fields.find((f) => f.question === "Product name")?.answer}
                </p>
              </header>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-night-900/80 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-bold">Question / field</th>
                      <th className="px-3 py-2 font-bold">Answer</th>
                      <th className="px-3 py-2 font-bold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.fields.map((row) => (
                      <tr
                        key={row.question}
                        className="border-t border-white/5 align-top"
                      >
                        <td className="w-[28%] px-3 py-2.5 font-medium text-slate-400">
                          {row.question}
                        </td>
                        <td className="px-3 py-2.5 whitespace-pre-wrap text-slate-100">
                          {row.answer}
                        </td>
                        <td className="w-24 px-3 py-2.5">
                          <span
                            className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${SOURCE_STYLE[row.source]}`}
                          >
                            {row.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {s.evidenceChecklist.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Evidence checklist (at analysis)
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {s.evidenceChecklist.map((row) => (
                      <li
                        key={row.question}
                        className="flex flex-wrap gap-2 rounded-lg border border-white/5 bg-night-900/40 px-3 py-2"
                      >
                        <span className="text-slate-400">{row.question}</span>
                        <span className="font-semibold capitalize text-white">
                          {row.answer}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.latestAnalysis?.commercialAnswer ? (
                <div className="mt-4 rounded-xl border border-rain/30 bg-rain/5 px-4 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rain-bright">
                    Latest hard commercial answer
                    <span className="ml-2 font-normal text-slate-500">
                      {new Date(s.latestAnalysis.at).toLocaleString()}
                      {s.latestAnalysis.score != null
                        ? ` · score ${s.latestAnalysis.score}`
                        : ""}
                    </span>
                  </h3>
                  <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[10px] uppercase text-slate-500">
                        Buyer
                      </dt>
                      <dd className="text-white">
                        {s.latestAnalysis.commercialAnswer.primary_buyer}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase text-slate-500">
                        Offer
                      </dt>
                      <dd className="text-slate-200">
                        {
                          s.latestAnalysis.commercialAnswer
                            .smallest_paid_offer
                        }
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[10px] uppercase text-slate-500">
                        Pain
                      </dt>
                      <dd className="text-slate-200">
                        {s.latestAnalysis.commercialAnswer.valuable_pain}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[10px] uppercase text-slate-500">
                        Honesty ({s.latestAnalysis.commercialAnswer.wedge_clarity})
                      </dt>
                      <dd className="text-slate-200">
                        {s.latestAnalysis.commercialAnswer.honesty_note}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">
                  No Analyzer run saved for this product yet.
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
