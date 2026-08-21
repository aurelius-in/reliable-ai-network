export function TrafficChart({
  title,
  grain,
  rangeLabel,
  rows,
}: {
  title: string;
  grain: "hour" | "day";
  rangeLabel: string;
  rows: { date: string; label: string; sessions: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  const labelEvery = grain === "hour" ? 3 : rows.length > 40 ? 14 : rows.length > 14 ? 3 : 1;

  return (
    <section className="rounded-2xl border border-night-600 bg-night-800 p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Unique sessions · {rangeLabel.toLowerCase()}
      </p>
      <div className="mt-4">
        <div className="flex h-36 items-end gap-px sm:gap-0.5">
          {rows.map((row) => {
            const h = Math.max(
              row.sessions ? 6 : 0,
              Math.round((row.sessions / max) * 100)
            );
            return (
              <div
                key={row.date}
                className="flex h-full min-w-0 flex-1 items-end"
                title={`${row.label}: ${row.sessions.toLocaleString()} sessions`}
              >
                <div
                  className="w-full rounded-t bg-aqua/80"
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-px sm:gap-0.5">
          {rows.map((row, i) => {
            const show =
              i === 0 || i === rows.length - 1 || i % labelEvery === 0;
            return (
              <p
                key={row.date}
                className="min-w-0 flex-1 truncate text-center text-[9px] leading-none text-slate-500"
              >
                {show ? row.label : ""}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function RevenueCards({
  monthly,
  potential,
  payingCount,
  trialCount,
  byTier,
}: {
  monthly: number;
  potential: number;
  payingCount: number;
  trialCount: number;
  byTier: {
    tier: string;
    label: string;
    price: number;
    paying: number;
    trialing: number;
  }[];
}) {
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const payingLine = byTier
    .filter((t) => t.paying > 0)
    .map((t) => `${t.paying} ${t.label} ($${t.price})`)
    .join(" · ");
  const trialLine = byTier
    .filter((t) => t.trialing > 0)
    .map((t) => `${t.trialing} ${t.label} ($${t.price})`)
    .join(" · ");

  return (
    <section>
      <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
        Revenue
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rain/40 bg-rain/10 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Monthly revenue
          </p>
          <p className="mt-1 text-3xl font-black text-rain-bright">
            {money(monthly)}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            {payingCount} active paid billing now
          </p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            {payingLine}
          </p>
        </div>
        <div className="rounded-2xl border border-aqua/25 bg-aqua/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            If trials convert
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {money(potential)}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            {payingCount} paid + {trialCount} trials stay on their current plan
          </p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500">
            Trials: {trialLine}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Reviewers are complimentary. Canceled and never-started accounts are not
        in either total. Amounts match the plan on each account below.
      </p>
    </section>
  );
}
