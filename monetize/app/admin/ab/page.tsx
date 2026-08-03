import { Logo } from "@/components/Logo";
import { assertAdminSecret } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { HOME_VARIANTS, type HomeVariant } from "@/lib/home-ab";

export const dynamic = "force-dynamic";
export const metadata = { title: "Homepage A/B — Make it RAIN" };

type SearchParams = Promise<{ key?: string; days?: string }>;

type EventRow = {
  name: string;
  session_id: string | null;
  props: Record<string, unknown> | null;
};

type VariantStats = {
  variant: HomeVariant;
  label: string;
  views: number;
  sessions: number;
  primaryClicks: number;
  secondaryClicks: number;
  signups: number;
};

function emptyStats(): Record<HomeVariant, VariantStats> {
  const out = {} as Record<HomeVariant, VariantStats>;
  (Object.keys(HOME_VARIANTS) as HomeVariant[]).forEach((v) => {
    out[v] = {
      variant: v,
      label: HOME_VARIANTS[v].label,
      views: 0,
      sessions: 0,
      primaryClicks: 0,
      secondaryClicks: 0,
      signups: 0,
    };
  });
  return out;
}

function isVariant(v: unknown): v is HomeVariant {
  return v === "a" || v === "b" || v === "c";
}

async function loadAbStats(days: number) {
  const admin = createAdminClient();
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const { data, error } = await admin
    .from("analytics_events")
    .select("name, session_id, props")
    .in("name", ["home_ab_view", "signup_success", "ui_click"])
    .gte("created_at", since)
    .limit(20000);

  if (error) return { error: error.message };

  const stats = emptyStats();
  const seenSessions: Record<HomeVariant, Set<string>> = {
    a: new Set(),
    b: new Set(),
    c: new Set(),
  };

  for (const row of (data ?? []) as EventRow[]) {
    const props = row.props ?? {};
    if (row.name === "home_ab_view" && isVariant(props.variant)) {
      const v = props.variant;
      stats[v].views += 1;
      if (row.session_id) seenSessions[v].add(row.session_id);
    } else if (row.name === "signup_success" && isVariant(props.home_ab)) {
      stats[props.home_ab].signups += 1;
    } else if (row.name === "ui_click" && typeof props.target === "string") {
      const m = /^hero_cta_(primary|secondary)_([abc])$/.exec(props.target);
      if (m && isVariant(m[2])) {
        if (m[1] === "primary") stats[m[2]].primaryClicks += 1;
        else stats[m[2]].secondaryClicks += 1;
      }
    }
  }

  (Object.keys(stats) as HomeVariant[]).forEach((v) => {
    stats[v].sessions = seenSessions[v].size;
  });

  return { stats: Object.values(stats) };
}

function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${((n / d) * 100).toFixed(1)}%`;
}

export default async function AdminAbPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key, days: daysRaw } = await searchParams;
  const gate = assertAdminSecret(key);

  if (!gate.ok) {
    return (
      <Shell>
        <div className="rounded-2xl border border-night-600 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Homepage A/B</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">
              /admin/ab?key=YOUR_SECRET
            </code>
          </p>
        </div>
      </Shell>
    );
  }

  const days = Math.min(Math.max(Number(daysRaw) || 30, 1), 365);
  const result = await loadAbStats(days);

  if ("error" in result) {
    return (
      <Shell>
        <p className="text-sm text-red-400">Failed to load: {result.error}</p>
      </Shell>
    );
  }

  const totalViews = result.stats.reduce((s, v) => s + v.views, 0);
  const totalSignups = result.stats.reduce((s, v) => s + v.signups, 0);

  return (
    <Shell>
      <h1 className="text-2xl font-black text-white">Homepage A/B</h1>
      <p className="mt-1 text-sm text-slate-400">
        Last {days} days · {totalViews} variant views · {totalSignups}{" "}
        attributed signups · change range with <code>&amp;days=7</code>
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-night-600 bg-night-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-night-600 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Sessions</th>
              <th className="px-4 py-3">Primary CTA</th>
              <th className="px-4 py-3">Secondary CTA</th>
              <th className="px-4 py-3">Signups</th>
              <th className="px-4 py-3">Session → signup</th>
            </tr>
          </thead>
          <tbody>
            {result.stats.map((v) => (
              <tr key={v.variant} className="border-b border-night-700/60">
                <td className="px-4 py-3 font-semibold text-white">
                  {v.variant.toUpperCase()}{" "}
                  <span className="font-normal text-slate-400">{v.label}</span>
                </td>
                <td className="px-4 py-3 text-slate-200">{v.views}</td>
                <td className="px-4 py-3 text-slate-200">{v.sessions}</td>
                <td className="px-4 py-3 text-slate-200">
                  {v.primaryClicks}{" "}
                  <span className="text-slate-500">
                    ({pct(v.primaryClicks, v.sessions)})
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {v.secondaryClicks}{" "}
                  <span className="text-slate-500">
                    ({pct(v.secondaryClicks, v.sessions)})
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-aqua-bright">
                  {v.signups}
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {pct(v.signups, v.sessions)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Kill rule of thumb: after ≥300 sessions per variant, retire the worst
        session→signup variant and introduce a new one with 2–3 intentional
        diffs. Force a variant with <code>/?v=a|b|c</code> (applies client-side
        after load).
      </p>
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
