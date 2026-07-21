import { Logo } from "@/components/Logo";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminSecret } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Signups — Make it RAIN" };

type SearchParams = Promise<{ key?: string }>;

export default async function AdminSignupsPage({
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
          <h1 className="text-xl font-bold text-white">Signup counter</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">
              /admin/signups?key=YOUR_SECRET
            </code>
          </p>
        </div>
      </Shell>
    );
  }

  const stats = await loadStats();

  if ("error" in stats) {
    return (
      <Shell>
        <div className="rounded-2xl border border-red-500/30 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Could not load signups</h1>
          <p className="mt-2 text-sm text-red-300">{stats.error}</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Signup counter</h1>
          <p className="mt-1 text-sm text-slate-400">
            Checked {new Date(stats.checkedAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total accounts" value={stats.total} highlight />
          <StatCard label="Last 24 hours" value={stats.last24Hours} />
          <StatCard label="Last 7 days" value={stats.last7Days} />
          <StatCard label="On Pro trial" value={stats.trialing} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-night-600 bg-night-800">
          <div className="border-b border-night-600 px-4 py-3 text-sm font-semibold text-slate-300">
            Recent signups
          </div>
          {stats.recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No accounts yet. After LinkedIn / Reddit clicks land, they’ll show
              here.
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
        </div>

        <p className="text-center text-xs text-slate-500">
          Bookmark this page with your key. Refresh anytime for a live count.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <Logo />
      <div className="mt-8 w-full max-w-3xl">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
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
        {value}
      </p>
    </div>
  );
}

async function loadStats() {
  try {
    const admin = createAdminClient();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: total, error: totalError },
      { count: last7Days, error: weekError },
      { count: last24Hours, error: dayError },
      { count: trialing, error: trialError },
      { data: recent, error: recentError },
    ] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dayAgo),
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "trialing"),
      admin
        .from("profiles")
        .select(
          "id, email, name, subscription_status, current_tier, trial_ends_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    const firstError =
      totalError || weekError || dayError || trialError || recentError;
    if (firstError) return { error: firstError.message };

    return {
      total: total ?? 0,
      last7Days: last7Days ?? 0,
      last24Hours: last24Hours ?? 0,
      trialing: trialing ?? 0,
      recent: recent ?? [],
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to load signups",
    };
  }
}
