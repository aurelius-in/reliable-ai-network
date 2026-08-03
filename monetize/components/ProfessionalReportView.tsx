import type { SharedReportPayload } from "@/lib/shared-report";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Aesthetic, print-ready Monetization Brief for public /r/[token] pages. */
export function ProfessionalReportView({
  payload,
  title,
}: {
  payload: SharedReportPayload;
  title: string;
}) {
  const { product, analysis, pricing, evidence_sources, generated_at } = payload;
  const date = generated_at.slice(0, 10);

  return (
    <article className="report-doc mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <header className="border-b border-stone-300 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
          Make it RAIN · Monetization Brief
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          {product.title}
        </h1>
        <p className="mt-2 text-sm text-stone-600">{title}</p>
        <p className="mt-4 text-xs text-stone-500">
          Generated {date}
          {product.product_url ? (
            <>
              {" · "}
              <a
                href={product.product_url}
                className="underline decoration-stone-300 underline-offset-2 hover:text-stone-800"
                target="_blank"
                rel="noreferrer"
              >
                {product.product_url.replace(/^https?:\/\//, "")}
              </a>
            </>
          ) : null}
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-stone-900">Scope &amp; evidence</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          This brief synthesizes founder-provided context with optional URL scrape,
          GitHub README, and uploaded documents. It is a commercial memo, not an
          independent market or financial audit. Unsupported claims are assumptions.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-stone-700">
          {evidence_sources.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-stone-900">Product</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Type</dt>
            <dd className="font-medium text-stone-900">{product.type}</dd>
          </div>
          {product.stage && (
            <div>
              <dt className="text-stone-500">Stage</dt>
              <dd className="font-medium text-stone-900">{product.stage}</dd>
            </div>
          )}
          {product.current_price && (
            <div>
              <dt className="text-stone-500">Current price</dt>
              <dd className="font-medium text-stone-900">{product.current_price}</dd>
            </div>
          )}
          {product.github_repo_url && (
            <div className="sm:col-span-2">
              <dt className="text-stone-500">GitHub</dt>
              <dd className="font-medium text-stone-900 break-all">
                {product.github_repo_url}
              </dd>
            </div>
          )}
        </dl>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
          {product.description}
        </p>
      </section>

      {product.website_context && (
        <section className="mt-10">
          <h2 className="font-serif text-xl text-stone-900">URL evidence</h2>
          <p className="mt-2 text-sm text-stone-600">
            Scraped {product.website_context.fetched_at.slice(0, 10)} from{" "}
            {product.website_context.final_url}
          </p>
          {product.website_context.title && (
            <p className="mt-2 text-sm font-medium text-stone-900">
              {product.website_context.title}
            </p>
          )}
          {product.website_context.meta_description && (
            <p className="mt-1 text-sm italic text-stone-600">
              {product.website_context.meta_description}
            </p>
          )}
          <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-700">
            {product.website_context.text_excerpt.slice(0, 2000)}
          </pre>
        </section>
      )}

      {product.traction?.trim() && (
        <section className="mt-10">
          <h2 className="font-serif text-xl text-stone-900">Traction</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
            {product.traction}
          </p>
        </section>
      )}

      {analysis && (
        <section className="mt-10">
          <h2 className="font-serif text-xl text-stone-900">Commercial assessment</h2>
          <div className="mt-4 flex flex-wrap items-end gap-6 border border-stone-200 bg-stone-50 px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-stone-500">
                Score
              </p>
              <p className="font-serif text-4xl font-semibold text-stone-900">
                {analysis.score}
                <span className="text-lg text-stone-400">/10</span>
              </p>
            </div>
            {analysis.confidence && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-stone-500">
                  Confidence
                </p>
                <p className="text-lg font-medium capitalize text-stone-900">
                  {analysis.confidence}
                </p>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">
            {analysis.score_reasoning}
          </p>
          <blockquote className="mt-6 border-l-2 border-stone-900 pl-4 font-serif text-lg text-stone-900">
            {analysis.big_promise}
          </blockquote>
          {analysis.assumptions && analysis.assumptions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Assumptions
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
                {analysis.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.kill_criteria && analysis.kill_criteria.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Kill criteria
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
                {analysis.kill_criteria.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.validation_plan && analysis.validation_plan.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Validation plan
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-700">
                {analysis.validation_plan.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            </div>
          )}
          {analysis.citations && analysis.citations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Evidence grades
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-stone-700">
                {analysis.citations.map((c, i) => (
                  <li key={i}>
                    <span className="font-semibold uppercase tracking-wide text-stone-500">
                      [{c.grade.replace(/_/g, " ")}]
                    </span>{" "}
                    {c.claim}{" "}
                    <span className="text-stone-500">({c.source})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {pricing && (
        <section className="mt-10">
          <h2 className="font-serif text-xl text-stone-900">Pricing economics</h2>
          <p className="mt-2 text-sm font-medium capitalize text-stone-900">
            Recommended model: {pricing.recommended_model.replace(/_/g, " ")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            {pricing.model_reasoning}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {pricing.price_ranges?.map((r, i) => (
              <div
                key={i}
                className="border border-stone-200 bg-white px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-wider text-stone-500">
                  {r.label}
                </p>
                <p className="mt-1 font-serif text-2xl text-stone-900">
                  {money(r.sweet_spot)}
                </p>
                <p className="text-xs text-stone-500">
                  {money(r.low)} – {money(r.high)}
                </p>
              </div>
            ))}
          </div>
          {pricing.pricing_experiment && (
            <div className="mt-6 border border-stone-200 bg-stone-50 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Pricing experiment
              </h3>
              <p className="mt-2 text-sm text-stone-700">
                {pricing.pricing_experiment}
              </p>
            </div>
          )}
        </section>
      )}

      <footer className="mt-14 border-t border-stone-300 pt-6 text-xs leading-relaxed text-stone-500">
        Prepared with Make it RAIN. Directional commercial memo — validate with
        buyers and finance before committing capital. Source inventory above
        defines what was available for this run.
      </footer>
    </article>
  );
}
