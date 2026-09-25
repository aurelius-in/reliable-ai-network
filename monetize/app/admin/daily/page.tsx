import { AdminOpsNav } from "@/components/admin/AdminOpsNav";
import { Logo } from "@/components/Logo";
import { assertAdminSecret } from "@/lib/admin-auth";
import { loadCounterStats } from "@/lib/counter-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today n/a Make it RAIN", robots: { index: false, follow: false } };

type SearchParams = Promise<{ key?: string }>;

type Kpi = { label: string; value: string };

type Card = {
  id: string;
  name: string;
  note: string;
  href: string;
  kpis: Kpi[];
};

export default async function DailyActivityPage({ searchParams }: { searchParams: SearchParams }) {
  const { key } = await searchParams;
  const gate = assertAdminSecret(key);
  if (!gate.ok) {
    return (
      <Shell>
        <div className="rounded-2xl border border-night-600 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Today</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">/admin/daily?key=YOUR_SECRET</code>
          </p>
        </div>
      </Shell>
    );
  }

  const cards = await Promise.all([
    rainCard(key!),
    remoteCard({
      id: "manifest",
      name: "ManifestOS",
      note: "Problems submitted, then how far the studio went.",
      origin: process.env.MANIFEST_ACTIVITY_ORIGIN || "https://manifestos.studio",
      secret: process.env.MANIFEST_ACTIVITY_SECRET,
      fallback: [
        { label: "Sessions", value: "n/a" },
        { label: "Problems submitted", value: "n/a" },
        { label: "Opened the studio", value: "n/a" },
      ],
    }),
    remoteCard({
      id: "apphole",
      name: "AppHole",
      note: "Checks started, and signups that began and did not finish.",
      origin: process.env.APPHOLE_ACTIVITY_ORIGIN || "https://apphole.pro",
      secret: process.env.APPHOLE_ACTIVITY_SECRET,
      fallback: [
        { label: "Sessions", value: "n/a" },
        { label: "Checks started", value: "n/a" },
        { label: "Signups unfinished", value: "n/a" },
      ],
    }),
  ]);

  return (
    <Shell>
      <div className="w-full max-w-4xl space-y-6">
        <AdminOpsNav adminKey={key!} current="daily" />
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Today</h1>
          <p className="mt-1 text-sm text-slate-400">Past week across the three products. Open a board when a number looks wrong.</p>
        </div>
        <div className="space-y-4">
          {cards.map((card) => (
            <article key={card.id} className="rounded-2xl border border-night-600 bg-night-800 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{card.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{card.note}</p>
                </div>
                <a
                  href={card.href}
                  className="inline-flex items-center justify-center rounded-full bg-aqua/20 px-4 py-2 text-sm font-semibold text-aqua-bright ring-1 ring-aqua/50 hover:bg-aqua/30"
                >
                  Open activity
                </a>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3">
                {card.kpis.map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-night-700 px-3 py-3">
                    <dt className="text-xs text-slate-500">{kpi.label}</dt>
                    <dd className="mt-1 text-2xl font-black tabular-nums text-white">{kpi.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
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

async function rainCard(adminKey: string): Promise<Card> {
  const href = `/admin/activity?key=${encodeURIComponent(adminKey)}&range=7d`;
  const stats = await loadCounterStats("7d");
  if ("error" in stats) {
    return {
      id: "rain",
      name: "Make it RAIN",
      note: stats.error,
      href,
      kpis: [
        { label: "Sessions", value: "n/a" },
        { label: "New accounts", value: "n/a" },
        { label: "Home bounce", value: "n/a" },
      ],
    };
  }
  const bounce = stats.clarity.homeBouncePct === null ? "n/a" : `${stats.clarity.homeBouncePct}%`;
  return {
    id: "rain",
    name: "Make it RAIN",
    note: "Sessions, new accounts, and how many homepage visits left without looking further.",
    href,
    kpis: [
      { label: "Sessions", value: String(stats.sessions) },
      { label: "New accounts", value: String(stats.accounts.newInRange) },
      { label: "Home bounce", value: bounce },
    ],
  };
}

async function remoteCard(input: {
  id: string;
  name: string;
  note: string;
  origin: string;
  secret: string | undefined;
  fallback: Kpi[];
}): Promise<Card> {
  const secret = input.secret?.trim();
  const href = secret
    ? `${input.origin.replace(/\/$/, "")}/ops/activity?key=${encodeURIComponent(secret)}&range=7d`
    : `${input.origin.replace(/\/$/, "")}/ops/activity`;
  if (!secret) {
    return { ...input, href, kpis: input.fallback, note: `${input.note} Set the activity secret on this server to load the numbers.` };
  }
  try {
    const url = new URL("/api/activity/summary", input.origin);
    url.searchParams.set("key", secret);
    url.searchParams.set("range", "7d");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { ...input, href, kpis: input.fallback, note: `${input.note} Summary did not load (${res.status}).` };
    }
    const body = (await res.json()) as { kpis?: Kpi[] };
    return { ...input, href, kpis: body.kpis?.length === 3 ? body.kpis : input.fallback };
  } catch {
    return { ...input, href, kpis: input.fallback, note: `${input.note} Summary did not load.` };
  }
}
