import { Logo } from "@/components/Logo";
import { CounterDashboard } from "@/components/admin/CounterDashboard";
import { assertAdminSecret } from "@/lib/admin-auth";
import { loadCounterStats, parseCounterRange } from "@/lib/counter-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counter — Make it RAIN" };

type SearchParams = Promise<{ key?: string; range?: string }>;

export default async function AdminCounterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key, range: rangeRaw } = await searchParams;
  const gate = assertAdminSecret(key);
  const range = parseCounterRange(rangeRaw);

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

  const stats = await loadCounterStats(range);

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

  return (
    <Shell>
      <CounterDashboard
        stats={stats}
        adminKey={key!}
        title="Counter"
        subtitle={`Accounts + site activity · ${stats.rangeLabel}`}
        showRecentAccounts
        bookmarkPath="/admin/counter"
      />
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
