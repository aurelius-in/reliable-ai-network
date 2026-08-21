import { Logo } from "@/components/Logo";
import { CounterDashboard } from "@/components/admin/CounterDashboard";
import { assertAdminSecret } from "@/lib/admin-auth";
import { parseCounterRange } from "@/lib/counter-stats";
import { loadCounterV3Stats } from "@/lib/counter-v3";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counter - Make it RAIN" };

type SearchParams = Promise<{ key?: string; range?: string }>;

export default async function AdminCounterV3Page({
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
              /admin/counter/v3?key=YOUR_SECRET
            </code>
          </p>
        </div>
      </Shell>
    );
  }

  const stats = loadCounterV3Stats(range);

  return (
    <Shell>
      <CounterDashboard
        stats={stats}
        adminKey={key!}
        title="Counter"
        subtitle={`Accounts + site activity · ${stats.rangeLabel}`}
        showRecentAccounts
        bookmarkPath="/admin/counter/v3"
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
