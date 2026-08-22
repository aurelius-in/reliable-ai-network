import { Logo } from "@/components/Logo";
import { CounterDashboard } from "@/components/admin/CounterDashboard";
import { parseCounterRange } from "@/lib/counter-stats";
import { loadCounterV3Stats } from "@/lib/counter-v3";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Counter - Make it RAIN",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ range?: string }>;

export default async function AdminCounterV3Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { range: rangeRaw } = await searchParams;
  const range = parseCounterRange(rangeRaw);
  const stats = loadCounterV3Stats(range);

  return (
    <Shell>
      <CounterDashboard
        stats={stats}
        title="Counter"
        subtitle={`Accounts + site activity · ${stats.rangeLabel}`}
        showRecentAccounts
        showFounderDebug={false}
        bookmarkPath="/admin/counter/v3"
        liveClock
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
