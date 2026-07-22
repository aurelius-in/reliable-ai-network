import Link from "next/link";
import { Logo } from "@/components/Logo";
import { assertAdminSecret } from "@/lib/admin-auth";
import { loadCounterStats } from "@/lib/counter-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counter — Make it RAIN" };

type SearchParams = Promise<{ key?: string }>;

export default async function AdminCounterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key } = await searchParams;
  const gate = assertAdminSecret(key);

  if (!gate.ok) {
    return (
      <Shell>
        <div className="rounded-2xl border border-night-600 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Counter</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">
              /admin/counter?key=YOUR_SECRET
            </code>
          </p>
        </div>
      </Shell>
    );
  }

  const stats = await loadCounterStats();

  if ("error" in stats) {
    return (
      <Shell>
        <div className="rounded-2xl border border-red-500/30 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Could not load Counter</h1>
          <p className="mt-2 text-sm text-red-300">{stats.error}</p>
        </div>
      </Shell>
    );
  }

  const maxFunnel = Math.max(...stats.funnel.map((f) => f.count), 1);

  return (
    <Shell>
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Counter</h1>
          <p className="mt-1 text-sm text-slate-400">
            Accounts + site activity · last 7 days · checked{" "}
            {new Date(stats.checkedAt).toLocaleString()}
          </p>
        </div>

        {/* Accounts */}
        <section>
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
            Accounts
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total" value={stats.accounts.total} highlight />
            <StatCard label="Last 24h" value={stats.accounts.last24Hours} />
            <StatCard label="Last 7d" value={stats.accounts.last7Days} />
            <StatCard label="Trialing" value={stats.accounts.trialing} />
            <StatCard label="Active paid" value={stats.accounts.active} />
            <StatCard label="Canceled" value={stats.accounts.canceled} />
          </div>
        </section>

        {/* Activity overview */}
        <section>
          <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
            Site activity (7d)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Sessions" value={stats.sessions} />
            <StatCard label="Page views" value={stats.pageViews} />
            <StatCard
              label="Tracking"
              valueLabel={stats.trackingReady ? "On" : "Off"}
              highlight={stats.trackingReady}
            />
          </div>
        </section>

        {/* Bottlenecks */}
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="text-sm font-bold text-amber-200">Where it&apos;s leaking</h2>
          <ul className="mt-3 space-y-2">
            {stats.bottlenecks.map((tip) => (
              <li key={tip} className="text-sm text-slate-300">
                · {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Funnel */}
        <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
          <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
            Visitor funnel (unique sessions, 7d)
          </div>
          {stats.funnel.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No funnel data yet. Open the live site after enabling tracking.
            </p>
          ) : (
            <ul className="divide-y divide-night-600">
              {stats.funnel.map((step) => (
                <li key={step.key} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-white">{step.label}</span>
                    <span className="tabular-nums text-slate-300">
                      {step.count}
                      {step.dropPct !== null && step.dropPct > 0 && (
                        <span className="ml-2 text-xs text-red-300">
                          −{step.dropPct}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-night-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-aqua to-rain"
                      style={{
                        width: `${Math.max(4, Math.round((step.count / maxFunnel) * 100))}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pages */}
          <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
            <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
              Pages people hit
            </div>
            {stats.pages.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No page views logged yet.
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

          {/* Events */}
          <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
            <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
              Key actions
            </div>
            {stats.events.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No actions yet (login errors, install, checkout cancel, etc.).
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
        </div>

        {/* Sources */}
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

        {/* Recent accounts */}
        <section className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
          <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
            Recent accounts
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
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.subscription_status
                        ? `${row.subscription_status}${row.current_tier ? ` / ${row.current_tier}` : ""}`
                        : "free account (no trial yet)"}
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

        <p className="text-center text-xs text-slate-500">
          Bookmark{" "}
          <Link href={`/admin/counter?key=${key}`} className="text-rain-bright">
            /admin/counter?key=…
          </Link>
          . Old URL /admin/signups still redirects here.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <Logo />
      <div className="mt-8 w-full max-w-4xl">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueLabel,
  highlight,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-rain/40 bg-rain/10"
          : "border-night-600 bg-night-800"
      }`}
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
    </div>
  );
}
