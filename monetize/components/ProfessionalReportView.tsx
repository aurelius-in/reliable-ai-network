import type { SharedReportPayload } from "@/lib/shared-report";
import {
  scoreScaleNote,
  toFounderFacingScore,
  toFounderFacingSurvival,
} from "@/lib/founder-facing-score";
import { cleanWebsiteExcerpt } from "@/lib/clean-website-excerpt";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-8 border-t border-stone-200 pt-6 ${className}`}>
      <h2 className="font-serif text-lg font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-1.5 text-[13px] leading-snug text-stone-700">
      {items.map((a, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
          <span>{a}</span>
        </li>
      ))}
    </ul>
  );
}

function Kv({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] leading-snug text-stone-800">
        {children}
      </dd>
    </div>
  );
}

/** Dense, print-ready Monetization Brief for public /r/[token] pages. */
export function ProfessionalReportView({
  payload,
  title,
}: {
  payload: SharedReportPayload;
  title: string;
}) {
  const {
    product,
    analysis,
    pricing,
    evidence_sources,
    generated_at,
    stress_test,
    tool_memo,
    extras,
    product_blurb,
  } = payload;
  const date = generated_at.slice(0, 10);
  const status = payload.status || "ready";

  if (status === "generating") {
    return (
      <article className="report-doc mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="border-b border-stone-300 pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Make it RAIN · First Customer Path
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {product.title}
          </h1>
          <p className="mt-1 text-[13px] text-stone-600">{title}</p>
        </header>
        <div className="mt-8 rounded border border-stone-300 bg-white px-5 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Generating
          </p>
          <p className="mt-2 text-[15px] leading-snug text-stone-800">
            Analyzer + Buyer Stress Test are running on this product. Refresh in
            a minute or two. The finished brief will appear on this same URL.
          </p>
          {payload.cover_note && (
            <p className="mt-3 text-[13px] text-stone-600">{payload.cover_note}</p>
          )}
        </div>
      </article>
    );
  }

  if (status === "failed") {
    return (
      <article className="report-doc mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="border-b border-stone-300 pb-5">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">
            {product.title}
          </h1>
        </header>
        <p className="mt-6 text-[14px] text-stone-700">
          Brief generation failed
          {payload.error ? `: ${payload.error}` : "."} Re-run from the admin
          brief page.
        </p>
      </article>
    );
  }

  const scoreInfo = analysis
    ? toFounderFacingScore(analysis.score)
    : null;
  const survival = stress_test
    ? toFounderFacingSurvival(stress_test.survival_score)
    : null;

  const blurb =
    product_blurb?.trim() ||
    product.website_context?.meta_description?.trim() ||
    (product.description.length < 500
      ? product.description
      : cleanWebsiteExcerpt(product.description, 360));

  const siteSignals = [
    product.website_context?.title,
    product.website_context?.meta_description,
  ].filter(Boolean) as string[];

  return (
    <article className="report-doc mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="border-b border-stone-300 pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
            Make it RAIN · First Customer Path
          </p>
          <p className="text-[11px] text-stone-500">
            {date}
            {product.product_url ? (
              <>
                {" · "}
                <a
                  href={product.product_url}
                  className="underline decoration-stone-300 underline-offset-2 hover:text-stone-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  {product.product_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </>
            ) : null}
          </p>
        </div>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          {product.title}
        </h1>
        <p className="mt-1 text-[13px] text-stone-600">{title}</p>
        {payload.cover_note?.trim() && (
          <p className="mt-3 text-[13px] leading-snug text-stone-700">
            {payload.cover_note}
          </p>
        )}
      </header>

      {/* Snapshot strip: score / gaps / next move, with commercial substance */}
      {(scoreInfo || survival || analysis?.commercial_answer) && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {scoreInfo && (
            <div className="rounded border border-stone-200 bg-stone-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Readiness
              </p>
              <p className="font-serif text-2xl font-semibold text-stone-900">
                {scoreInfo.display}
                <span className="text-sm text-stone-400">/10</span>
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-stone-600">
                {scoreInfo.label}
              </p>
            </div>
          )}
          {survival != null && stress_test && (
            <div className="rounded border border-stone-200 bg-stone-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Stress test
              </p>
              <p className="font-serif text-2xl font-semibold capitalize text-stone-900">
                {stress_test.verdict}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-600">
                Survival {survival}/10
              </p>
            </div>
          )}
          {stress_test?.fatal_objections?.length ? (
            <div className="rounded border border-stone-200 bg-stone-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Gaps that kill the offer
              </p>
              <p className="font-serif text-2xl font-semibold text-stone-900">
                {stress_test.fatal_objections.length}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-stone-600">
                {stress_test.fatal_objections[0]}
              </p>
            </div>
          ) : null}
          {analysis?.commercial_answer && (
            <div className="rounded border border-stone-200 bg-stone-50 px-3 py-2.5 sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Who may pay first
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-stone-900">
                {analysis.commercial_answer.primary_buyer}
              </p>
            </div>
          )}
          {analysis?.commercial_answer?.smallest_paid_offer && (
            <div className="rounded border border-stone-200 bg-stone-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Price to test
              </p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-stone-900">
                {analysis.commercial_answer.smallest_paid_offer}
              </p>
            </div>
          )}
        </div>
      )}

      {(stress_test?.dm_opener_after_test ||
        extras?.conversation_ask ||
        extras?.this_week?.[0]) && (
        <section className="mt-5 rounded border border-stone-800 bg-stone-900 px-4 py-3.5 text-stone-50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Next conversation (this is the product)
          </p>
          {stress_test?.offer_rewrite?.who_may_pay && (
            <p className="mt-2 text-[12px] text-stone-300">
              Talk to: {stress_test.offer_rewrite.who_may_pay}
            </p>
          )}
          {stress_test?.dm_opener_after_test && (
            <p className="mt-2 text-[14px] font-medium leading-snug">
              {stress_test.dm_opener_after_test}
            </p>
          )}
          {extras?.conversation_ask && (
            <p className="mt-2 text-[13px] text-stone-200">
              <span className="font-semibold text-white">Ask: </span>
              {extras.conversation_ask}
            </p>
          )}
          {extras?.this_week?.[0]?.action && (
            <p className="mt-2 text-[12px] text-stone-400">
              This week, step 1: {extras.this_week[0].action}
            </p>
          )}
        </section>
      )}

      {scoreInfo && analysis && (
        <p className="mt-3 text-[12px] leading-snug text-stone-600">
          {analysis.score_reasoning.includes("5-10")
            ? analysis.score_reasoning
            : `${scoreScaleNote()} ${analysis.score_reasoning}`}
        </p>
      )}

      {tool_memo && (
        <Section title={tool_memo.tool_label || "Tool brief"}>
          <p className="text-[14px] font-medium leading-snug text-stone-900">
            {tool_memo.headline}
          </p>
          {tool_memo.bullets?.length > 0 && (
            <div className="mt-3">
              <Bullets items={tool_memo.bullets} />
            </div>
          )}
          {tool_memo.next_action && (
            <p className="mt-3 text-[13px] text-stone-700">
              <span className="font-semibold">Next: </span>
              {tool_memo.next_action}
            </p>
          )}
        </Section>
      )}

      {extras?.executive_summary?.length ? (
        <Section title="Executive summary">
          <Bullets items={extras.executive_summary} />
        </Section>
      ) : null}

      <Section title="Product snapshot">
        <dl className="grid gap-3 sm:grid-cols-3">
          <Kv label="Type">{product.type}</Kv>
          {product.stage && <Kv label="Stage">{product.stage}</Kv>}
          {product.current_price && (
            <Kv label="Packaging">{product.current_price}</Kv>
          )}
        </dl>
        <p className="mt-3 text-[13px] leading-snug text-stone-700">{blurb}</p>
        {product.traction?.trim() && (
          <p className="mt-2 text-[12px] leading-snug text-stone-600">
            <span className="font-medium text-stone-800">Traction: </span>
            {product.traction}
          </p>
        )}
        {siteSignals.length > 0 && (
          <p className="mt-2 text-[11px] leading-snug text-stone-500">
            Site signals: {siteSignals.join(" · ")}
          </p>
        )}
        <p className="mt-2 text-[11px] text-stone-500">
          Evidence: {evidence_sources.join(" · ")}
        </p>
      </Section>

      {analysis?.commercial_answer && (
        <Section title="Hard commercial answer">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Kv label="Valuable pain">
              {analysis.commercial_answer.valuable_pain}
            </Kv>
            <Kv label="Smallest paid offer">
              {analysis.commercial_answer.smallest_paid_offer}
            </Kv>
            <Kv label="Wedge">
              <span className="capitalize">
                {analysis.commercial_answer.wedge_clarity}
              </span>
              {": "}
              {analysis.commercial_answer.honesty_note}
            </Kv>
            <Kv label="What would disprove">
              {analysis.commercial_answer.what_would_disprove}
            </Kv>
          </dl>
          <p className="mt-3 text-[13px] leading-snug text-stone-700">
            <span className="font-medium text-stone-900">Why this path: </span>
            {analysis.commercial_answer.why_this_path}
          </p>
          {analysis.big_promise && (
            <blockquote className="mt-3 border-l-2 border-stone-800 pl-3 font-serif text-[15px] leading-snug text-stone-900">
              {analysis.big_promise}
            </blockquote>
          )}
        </Section>
      )}

      {extras && (
        <>
          {(extras.strengths?.length > 0 || extras.risks?.length > 0) && (
            <Section title="Strengths & risks">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Strengths
                  </p>
                  <Bullets items={extras.strengths || []} />
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Risks
                  </p>
                  <Bullets items={extras.risks || []} />
                </div>
              </div>
            </Section>
          )}

          {(extras.who_to_include?.length > 0 ||
            extras.who_to_exclude?.length > 0) && (
            <Section title="Who to test (and who to skip)">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                    Include first
                  </p>
                  <Bullets items={extras.who_to_include || []} />
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Exclude for now
                  </p>
                  <Bullets items={extras.who_to_exclude || []} />
                </div>
              </div>
            </Section>
          )}

          {extras.substitutes?.length > 0 && (
            <Section title="What they use instead">
              <div className="overflow-hidden rounded border border-stone-200">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-2.5 py-1.5 font-semibold">Substitute</th>
                      <th className="px-2.5 py-1.5 font-semibold">Why</th>
                      <th className="px-2.5 py-1.5 font-semibold">Your edge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extras.substitutes.map((s, i) => (
                      <tr key={i} className="border-t border-stone-100">
                        <td className="px-2.5 py-2 align-top font-medium text-stone-900">
                          {s.name}
                        </td>
                        <td className="px-2.5 py-2 align-top text-stone-700">
                          {s.why_they_use_it}
                        </td>
                        <td className="px-2.5 py-2 align-top text-stone-700">
                          {s.how_you_beat_it}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {(extras.stop_saying?.length > 0 ||
            extras.start_saying?.length > 0) && (
            <Section title="Positioning cut">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Stop leading with
                  </p>
                  <Bullets items={extras.stop_saying || []} />
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Start leading with
                  </p>
                  <Bullets items={extras.start_saying || []} />
                </div>
              </div>
            </Section>
          )}

          {extras.pricing_hypothesis && (
            <Section title="Pricing hypothesis">
              <dl className="grid gap-3 sm:grid-cols-3">
                <Kv label="Suggested">{extras.pricing_hypothesis.suggested}</Kv>
                <Kv label="Packaging">
                  {extras.pricing_hypothesis.packaging}
                </Kv>
                <Kv label="Why">{extras.pricing_hypothesis.why}</Kv>
              </dl>
            </Section>
          )}

          {extras.this_week?.length > 0 && (
            <Section title="This week">
              <ol className="space-y-2">
                {extras.this_week.map((w, i) => (
                  <li
                    key={i}
                    className="grid gap-1 rounded border border-stone-200 bg-white px-3 py-2 sm:grid-cols-[2rem_1fr]"
                  >
                    <span className="font-serif text-lg text-stone-400">
                      {w.step || i + 1}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-stone-900">
                        {w.action}
                      </p>
                      <p className="mt-0.5 text-[12px] text-stone-600">
                        Success: {w.success_signal}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </>
      )}

      {stress_test && (
        <Section title="Buyer Stress Test">
          {stress_test.verdict_line && (
            <p className="text-[13px] leading-snug text-stone-800">
              {stress_test.verdict_line}
            </p>
          )}
          {stress_test.offer_rewrite && (
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              <Kv label="Who may pay">
                {stress_test.offer_rewrite.who_may_pay}
              </Kv>
              <Kv label="Paid offer">
                {stress_test.offer_rewrite.smallest_paid_offer}
              </Kv>
              <Kv label="Pitch">
                {stress_test.offer_rewrite.one_line_pitch}
              </Kv>
            </dl>
          )}
          {stress_test.rounds?.length > 0 && (
            <div className="mt-4 overflow-hidden rounded border border-stone-200">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-2 py-1.5 font-semibold">#</th>
                    <th className="px-2 py-1.5 font-semibold">Buyer</th>
                    <th className="px-2 py-1.5 font-semibold">Pushback</th>
                    <th className="px-2 py-1.5 font-semibold">Outcome</th>
                    <th className="px-2 py-1.5 font-semibold">Lesson</th>
                  </tr>
                </thead>
                <tbody>
                  {stress_test.rounds.map((r, i) => (
                    <tr key={i} className="border-t border-stone-100 align-top">
                      <td className="px-2 py-2 text-stone-400">{i + 1}</td>
                      <td className="px-2 py-2 font-medium text-stone-900">
                        {r.buyer_name}
                        {r.buyer_type ? (
                          <span className="block font-normal text-stone-500">
                            {r.buyer_type}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 text-stone-700">
                        {r.opening_pushback}
                      </td>
                      <td className="px-2 py-2 capitalize text-stone-800">
                        {String(r.outcome || "").replace(/_/g, " ")}
                      </td>
                      <td className="px-2 py-2 text-stone-700">{r.lesson}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {stress_test.fatal_objections?.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Fatal objections
                </p>
                <Bullets items={stress_test.fatal_objections} />
              </div>
            )}
            {stress_test.do_not_message_until?.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Fix before outreach
                </p>
                <Bullets items={stress_test.do_not_message_until} />
              </div>
            )}
          </div>
          {stress_test.dm_opener_after_test && (
            <div className="mt-4 rounded border border-stone-800 bg-stone-900 px-3 py-2.5 text-stone-50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Ready-to-send opener
              </p>
              <p className="mt-1 text-[13px] leading-snug">
                {stress_test.dm_opener_after_test}
              </p>
            </div>
          )}
        </Section>
      )}

      {extras?.one_page_pitch && (
        <Section title="One-page pitch (for mentors / advisors)">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-stone-800">
            {extras.one_page_pitch}
          </p>
        </Section>
      )}

      {analysis &&
        (analysis.assumptions?.length ||
          analysis.kill_criteria?.length ||
          analysis.validation_plan?.length) && (
          <Section title="Assumptions, kill criteria, validation">
            <div className="grid gap-4 sm:grid-cols-3">
              {analysis.assumptions && analysis.assumptions.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Assumptions
                  </p>
                  <Bullets items={analysis.assumptions} />
                </div>
              )}
              {analysis.kill_criteria && analysis.kill_criteria.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Kill if
                  </p>
                  <Bullets items={analysis.kill_criteria} />
                </div>
              )}
              {analysis.validation_plan &&
                analysis.validation_plan.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                      Validate next
                    </p>
                    <Bullets items={analysis.validation_plan} />
                  </div>
                )}
            </div>
          </Section>
        )}

      {analysis?.quick_wins && analysis.quick_wins.length > 0 && (
        <Section title="Quick wins">
          <Bullets items={analysis.quick_wins} />
        </Section>
      )}

      {analysis?.recommended_paths && analysis.recommended_paths.length > 0 && (
        <Section title="Monetization paths (ranked)">
          <ol className="space-y-2">
            {analysis.recommended_paths.map((p, i) => (
              <li key={i} className="text-[13px] leading-snug text-stone-700">
                <span className="font-medium text-stone-900">
                  {i + 1}. {p.name}
                </span>
                {" · "}
                {p.description}
                <span className="text-stone-500">
                  {" "}
                  ({p.effort} effort, {p.revenue_potential} revenue potential)
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {pricing && (
        <Section title="Pricing economics">
          <p className="text-[13px] capitalize text-stone-800">
            Model: {pricing.recommended_model.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-stone-700">
            {pricing.model_reasoning}
          </p>
          {pricing.price_ranges?.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {pricing.price_ranges.map((r, i) => (
                <div
                  key={i}
                  className="border border-stone-200 bg-stone-50 px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wider text-stone-500">
                    {r.label}
                  </p>
                  <p className="font-serif text-xl text-stone-900">
                    {money(r.sweet_spot)}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {money(r.low)} - {money(r.high)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {analysis?.citations && analysis.citations.length > 0 && (
        <Section title="Evidence grades">
          <ul className="space-y-1 text-[12px] leading-snug text-stone-600">
            {analysis.citations.map((c, i) => (
              <li key={i}>
                <span className="font-semibold uppercase tracking-wide text-stone-500">
                  {c.grade.replace(/_/g, " ")}
                </span>
                {": "}
                {c.claim}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <footer className="mt-8 border-t border-stone-300 pt-4 text-[11px] leading-snug text-stone-500">
        Make it RAIN Founder Brief. Directional commercial memo. Validate with
        buyers before committing capital. Scores use a 5-10 readiness scale
        (see note above).
      </footer>
    </article>
  );
}
