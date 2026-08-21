import Link from "next/link";
import { AdminOpsNav } from "@/components/admin/AdminOpsNav";
import { RevenueCards, TrafficChart } from "@/components/admin/CounterCharts";
import {
  COUNTER_RANGES,
  type CounterRange,
  type CounterRow,
  type CounterStats,
  type Insight,
} from "@/lib/counter-stats";
import { TIERS } from "@/lib/tiers";

/** Insights / copy that should stay on the private counter only. */
function isFounderOnlyInsight(tip: Insight): boolean {
  if (tip.founderOnly) return true;
  const text = `${tip.title} ${tip.detail}`.toLowerCase();
  return (
    text.includes("test account") ||
    text.includes("likely test") ||
    text.includes("real-looking") ||
    text.includes("your own test") ||
    text.includes("look like tests")
  );
}

function shareSafeHeadline(headline: string): string {
  return headline
    .replace(/\s*·\s*no real-looking new signups this window/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function accountBillLabel(row: CounterRow): string | null {
  const price = TIERS.find((t) => t.id === row.current_tier)?.price;
  if (row.subscription_status === "active" && price) {
    return `$${price}/mo`;
  }
  if (row.subscription_status === "trialing" && price) {
    return `$${price}/mo after trial`;
  }
  if (row.subscription_status === "reviewer") return "complimentary";
  if (row.subscription_status === "canceled") return "$0 (canceled)";
  return "$0";
}

export function CounterDashboard({
  stats,
  adminKey = "",
  title,
  subtitle,
  showRecentAccounts,
  showFounderDebug,
  bookmarkPath,
}: {
  stats: CounterStats;
  adminKey?: string;
  title: string;
  subtitle: string;
  showRecentAccounts: boolean;
  /** Founder-only debug cards (likely tests, real-looking new, early cohort). */
  showFounderDebug?: boolean;
  bookmarkPath: string;
}) {
  // Activity Counter is shareable: hide founder-only signals.
  const shareSafe = !showRecentAccounts;
  const founderDebug = showFounderDebug ?? showRecentAccounts;
  const maxFunnel = Math.max(...stats.funnel.map((f) => f.count), 1);
  const q = (range: CounterRange) => {
    const params = new URLSearchParams();
    if (adminKey) params.set("key", adminKey);
    params.set("range", range);
    return `${bookmarkPath}?${params.toString()}`;
  };
  const headline = shareSafe
    ? shareSafeHeadline(stats.headline)
    : stats.headline;
  const insights = shareSafe
    ? stats.insights.filter((tip) => !isFounderOnlyInsight(tip))
    : stats.insights;

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Private Counter: no nav. Shareable Activity: ops strip only (never Counter). */}
      {shareSafe && (
        <AdminOpsNav
          adminKey={adminKey}
          current="activity"
          range={stats.range}
        />
      )}

      <div className="text-center">
        <h1 className="text-2xl font-black text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {subtitle} · checked {new Date(stats.checkedAt).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {COUNTER_RANGES.map((r) => {
          const active = stats.range === r.id;
          return (
            <Link
              key={r.id}
              href={q(r.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                active
                  ? "bg-aqua/20 text-aqua-bright ring-1 ring-aqua/50"
                  : "bg-night-800 text-slate-400 ring-1 ring-night-600 hover:text-white"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-aqua/25 bg-aqua/5 p-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-aqua">
          {stats.rangeLabel} snapshot
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {headline}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
          Accounts (live snapshot)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Total" value={stats.accounts.total} highlight />
          <StatCard
            label="Never started trial"
            value={stats.accounts.freeNoTrial}
            hint="Signed up, no card / trial"
          />
          <StatCard
            label="Trialing"
            value={stats.accounts.trialing}
            hint="Card on file, trial in progress"
          />
          <StatCard
            label="Reviewers"
            value={stats.accounts.reviewer}
            hint={shareSafe ? "Complimentary access" : "No-card complimentary"}
          />
          <StatCard
            label="Active paid"
            value={stats.accounts.active}
            hint="Currently billing"
          />
          <StatCard
            label="Canceled"
            value={stats.accounts.canceled}
            hint="Ended trial or subscription"
          />
          {founderDebug && (
            <StatCard
              label="Likely tests"
              value={stats.accounts.likelyTests}
              hint="test@, RoleFerry, founder patterns"
            />
          )}
          <StatCard
            label={`New · ${stats.rangeLabel}`}
            value={stats.accounts.newInRange}
          />
          {founderDebug && (
            <>
              <StatCard
                label={`Real-looking new · ${stats.rangeLabel}`}
                value={stats.accounts.realLookingNewInRange}
                hint="New accounts excluding likely tests"
              />
              <StatCard
                label="Early learning cohort"
                valueLabel={`${stats.accounts.earlyCohortFilled}/100`}
                hint="First 100 accounts by signup time (silent tag)"
              />
            </>
          )}
        </div>
      </section>

      {stats.revenue && (
        <RevenueCards
          monthly={stats.revenue.monthly}
          potential={stats.revenue.potential}
          payingCount={stats.revenue.payingCount}
          trialCount={stats.revenue.trialCount}
          byTier={stats.revenue.byTier}
        />
      )}

      {stats.trafficByDay && stats.trafficByDay.length > 0 && (
        <TrafficChart
          title={
            stats.trafficGrain === "hour"
              ? "Sessions by hour"
              : "Sessions by day"
          }
          grain={stats.trafficGrain ?? "day"}
          rangeLabel={stats.rangeLabel}
          rows={stats.trafficByDay}
        />
      )}

      <section>
        <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
          Site activity ({stats.rangeLabel.toLowerCase()})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Sessions" value={stats.sessions} />
          <StatCard label="Page views" value={stats.pageViews} />
          <StatCard
            label="Home bounce"
            value={stats.bouncedHome}
            hint="Home only — no CTA / pricing / signup"
          />
          <StatCard
            label="Tracking"
            valueLabel={stats.trackingReady ? "On" : "Off"}
            highlight={stats.trackingReady}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
          Clarity signals ({stats.rangeLabel.toLowerCase()})
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Whether visitors understand you commercialize products they own (not
          build their app). Watch bounce vs interest, pricing→signup, FAQ opens,
          and checkout completion.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Home → interest"
            valueLabel={
              stats.clarity.interestRatePct === null
                ? "—"
                : `${stats.clarity.interestRatePct}%`
            }
            hint={`${stats.clarity.interestSessions} of ${stats.clarity.homeSessions} home sessions`}
          />
          <StatCard
            label="Home bounce rate"
            valueLabel={
              stats.clarity.homeBouncePct === null
                ? "—"
                : `${stats.clarity.homeBouncePct}%`
            }
            hint={`${stats.clarity.homeBounce} bounced`}
          />
          <StatCard
            label="Pricing → signup"
            valueLabel={
              stats.clarity.pricingToSignupPct === null
                ? "—"
                : `${stats.clarity.pricingToSignupPct}%`
            }
            hint={`${stats.clarity.signupSessions} signup / ${stats.clarity.pricingSessions} pricing`}
          />
          <StatCard
            label="Checkout → trial"
            valueLabel={
              stats.clarity.checkoutConvertPct === null
                ? "—"
                : `${stats.clarity.checkoutConvertPct}%`
            }
            hint={`${stats.clarity.trialStarts} trials / ${stats.clarity.checkoutSessions} checkout`}
          />
          <StatCard
            label="FAQ opens"
            value={stats.clarity.faqOpens}
            hint="Homepage FAQ accordion opens"
          />
          <StatCard
            label="Code-ownership FAQ"
            value={stats.clarity.ownershipFaqOpens}
            hint="“Do you build/own my code?” opens"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
        <div className="border-b border-night-600 px-4 py-3">
          <p className="text-sm font-semibold text-slate-300">
            What stopped you from continuing? ({stats.rangeLabel.toLowerCase()})
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Exit / trust survey activity on invite, signup, and sample
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 border-b border-night-600 p-4">
          <StatCard
            label="Shown"
            value={stats.exitSurvey.shown}
            hint="Survey panel opened"
          />
          <StatCard
            label="Submitted"
            value={stats.exitSurvey.submitted}
            hint="Sent a reason"
            highlight={stats.exitSurvey.submitted > 0}
          />
          <StatCard
            label="Dismissed"
            value={stats.exitSurvey.dismissed}
            hint="Closed without sending"
          />
        </div>
        {stats.exitSurvey.total === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            {stats.exitSurvey.shown === 0
              ? "No survey activity in this window."
              : "Survey was shown, but no reasons submitted yet."}
          </p>
        ) : (
          <ul className="divide-y divide-night-600">
            {stats.exitSurvey.reasons.map((row) => (
              <li
                key={row.reason}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <p className="text-sm font-medium text-white">{row.label}</p>
                <p className="shrink-0 text-lg font-black tabular-nums text-white">
                  {row.count}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
        <div className="border-b border-night-600 px-4 py-3">
          <p className="text-sm font-semibold text-slate-300">
            Homepage A / B / C ({stats.rangeLabel.toLowerCase()})
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Views and CTAs from assigned hero variants. Signups attributed via{" "}
            <code className="text-slate-400">home_ab</code> cookie.
            {adminKey ? (
              <>
                {" "}
                <Link
                  href={`/admin/ab?key=${encodeURIComponent(adminKey)}&days=${
                    stats.range === "today"
                      ? 1
                      : stats.range === "7d"
                        ? 7
                        : stats.range === "month"
                          ? 30
                          : 90
                  }`}
                  className="font-semibold text-aqua hover:text-aqua-bright"
                >
                  Full A/B page
                </Link>
              </>
            ) : null}
          </p>
        </div>
        {stats.homeAb.every((v) => v.views === 0 && v.signups === 0) ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No homepage variant events in this window yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-night-600 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Variant</th>
                  <th className="px-4 py-2.5">Views</th>
                  <th className="px-4 py-2.5">Sessions</th>
                  <th className="px-4 py-2.5">Primary</th>
                  <th className="px-4 py-2.5">Secondary</th>
                  <th className="px-4 py-2.5">Signups</th>
                  <th className="px-4 py-2.5">Sess → signup</th>
                </tr>
              </thead>
              <tbody>
                {stats.homeAb.map((v) => (
                  <tr
                    key={v.variant}
                    className="border-b border-night-700/60 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-semibold text-white">
                      {v.variant.toUpperCase()}{" "}
                      <span className="font-normal text-slate-500">
                        {v.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-200">
                      {v.views}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-200">
                      {v.sessions}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-200">
                      {v.primaryClicks}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-200">
                      {v.secondaryClicks}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-semibold text-aqua-bright">
                      {v.signups}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-200">
                      {v.sessionToSignupPct === null
                        ? "—"
                        : `${v.sessionToSignupPct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h2 className="text-sm font-bold text-amber-200">
          What&apos;s scaring people off
        </h2>
        <ul className="mt-4 space-y-3">
          {insights.length === 0 ? (
            <li className="text-sm text-slate-400">
              No standout scare-offs in this window yet.
            </li>
          ) : (
            insights.map((tip) => (
              <InsightRow key={tip.title + tip.detail} tip={tip} />
            ))
          )}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
        <div className="border-b border-night-600 px-4 py-3">
          <p className="text-sm font-semibold text-slate-300">
            Conversion funnel (unique sessions, {stats.rangeLabel.toLowerCase()})
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Each step is a subset path. % continued = of the previous step. % of
            home = of homepage visitors.
          </p>
        </div>
        {stats.funnel.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No funnel data yet.
          </p>
        ) : (
          <ul className="divide-y divide-night-600">
            {stats.funnel.map((step, i) => (
              <li key={step.key} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      <span className="mr-2 text-xs text-slate-500">
                        {i + 1}.
                      </span>
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{step.hint}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums font-bold text-white">
                      {step.count}
                    </p>
                    {step.continuePct !== null && (
                      <p className="text-xs text-slate-400">
                        {step.continuePct}% continued
                      </p>
                    )}
                    {step.ofTopPct !== null && (
                      <p className="text-xs text-slate-500">
                        {step.ofTopPct}% of home
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-night-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-aqua to-rain"
                    style={{
                      width: `${Math.max(
                        step.count ? 4 : 0,
                        Math.round((step.count / maxFunnel) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
        <div className="border-b border-night-600 px-4 py-3">
          <p className="text-sm font-semibold text-slate-300">
            Feature usage (15 tools, {stats.rangeLabel.toLowerCase()})
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Views = opened in the pie · Runs = successful generate
          </p>
        </div>
        {stats.tools.every((t) => t.views === 0 && t.runs === 0) ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No tool opens or runs in this window.
          </p>
        ) : (
          <ul className="divide-y divide-night-600">
            {stats.tools.map((t) => {
              const maxTool = Math.max(
                ...stats.tools.map((x) => Math.max(x.views, x.runs)),
                1
              );
              return (
                <li key={t.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-white">{t.label}</span>
                    <span className="shrink-0 tabular-nums text-slate-400">
                      {t.views} view{t.views === 1 ? "" : "s"} · {t.runs} run
                      {t.runs === 1 ? "" : "s"}
                      {t.runRatePct !== null && (
                        <span className="ml-2 text-xs text-slate-500">
                          {t.runRatePct}% run
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-night-700">
                      <div
                        className="h-full rounded-full bg-aqua/80"
                        style={{
                          width: `${Math.max(
                            t.views ? 4 : 0,
                            Math.round((t.views / maxTool) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-night-700">
                      <div
                        className="h-full rounded-full bg-rain"
                        style={{
                          width: `${Math.max(
                            t.runs ? 4 : 0,
                            Math.round((t.runs / maxTool) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
          <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
            UI clicks
          </div>
          {stats.clicks.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No named clicks in this window.
            </p>
          ) : (
            <ul className="divide-y divide-night-600">
              {stats.clicks.map((c) => (
                <li
                  key={c.target}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <code className="truncate text-aqua-bright">{c.target}</code>
                  <span className="tabular-nums font-bold text-white">
                    {c.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
          <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
            Pages people hit
          </div>
          {stats.pages.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No page views in this window.
            </p>
          ) : (
            <ul className="divide-y divide-night-600">
              {stats.pages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <code className="truncate text-aqua-bright">{p.path}</code>
                  <span className="shrink-0 tabular-nums text-slate-400">
                    {p.views} views · {p.sessions} sess
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
        <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
          Key actions
        </div>
        {stats.events.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No actions in this window.
          </p>
        ) : (
          <ul className="divide-y divide-night-600">
            {stats.events.map((e) => (
              <li
                key={e.name}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <code className="text-pink">{e.name}</code>
                <span className="tabular-nums font-bold text-white">
                  {e.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
        <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
          Traffic sources (utm_source)
        </div>
        {stats.sources.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Add ?utm_source=linkedin&utm_medium=dm to outreach links.
          </p>
        ) : (
          <ul className="divide-y divide-night-600">
            {stats.sources.map((s) => (
              <li
                key={s.source}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span className="text-white">{s.source}</span>
                <span className="tabular-nums text-slate-400">
                  {s.sessions} sessions
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showRecentAccounts && (
        <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
          <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
            Recent accounts ({stats.recent.length})
          </div>
          {stats.recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No accounts yet.
            </p>
          ) : (
            <ul className="divide-y divide-night-600">
              {stats.recent.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {row.name || "Unnamed"}{" "}
                      <span className="font-normal text-slate-400">
                        · {row.email}
                      </span>
                      {founderDebug && row.likelyTest && (
                        <span className="ml-2 rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Likely test
                        </span>
                      )}
                      {founderDebug && row.earlyCohortRank != null && (
                        <span className="ml-2 rounded-full bg-aqua/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-aqua">
                          Early #{row.earlyCohortRank}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.subscription_status
                        ? `${row.subscription_status}${row.current_tier ? ` / ${row.current_tier}` : ""}`
                        : "Never started trial (no card)"}
                      {stats.revenue
                        ? ` · ${accountBillLabel(row)}`
                        : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-slate-500">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : "-"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="text-center text-xs text-slate-500">
        Bookmark{" "}
        <Link href={q(stats.range)} className="text-rain-bright">
          {adminKey
            ? `${bookmarkPath}?key=…&range=${stats.range}`
            : `${bookmarkPath}?range=${stats.range}`}
        </Link>
        .
      </p>
    </div>
  );
}

function InsightRow({ tip }: { tip: Insight }) {
  const tone =
    tip.severity === "critical"
      ? "text-red-300"
      : tip.severity === "warn"
        ? "text-amber-200"
        : "text-slate-300";
  const badge =
    tip.severity === "critical"
      ? "Critical"
      : tip.severity === "warn"
        ? "Watch"
        : "Note";
  return (
    <li className="rounded-xl border border-white/5 bg-black/20 px-3 py-2.5">
      <p className={`text-sm font-semibold ${tone}`}>
        <span className="mr-2 text-[10px] font-bold uppercase tracking-wider opacity-80">
          {badge}
        </span>
        {tip.title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{tip.detail}</p>
    </li>
  );
}

function StatCard({
  label,
  value,
  valueLabel,
  highlight,
  hint,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-rain/40 bg-rain/10"
          : "border-night-600 bg-night-800"
      }`}
      title={hint}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-black ${
          highlight ? "text-rain-bright" : "text-white"
        }`}
      >
        {valueLabel ?? value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>
      )}
    </div>
  );
}
