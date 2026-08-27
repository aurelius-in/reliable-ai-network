import { assertAdminSecret } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminOpsNav } from "@/components/admin/AdminOpsNav";
import { SelectDecisionForm } from "@/rain-select/SelectDecisionForm";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ key?: string }>;

export default async function SelectApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key } = await searchParams;
  const gate = assertAdminSecret(key);
  if (!gate.ok) {
    return (
      <div className="px-4 py-16 text-center text-slate-400">
        Add ?key= to open RAIN Select applications.
      </div>
    );
  }

  let rows: Record<string, unknown>[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("rain_select_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    rows = (data as Record<string, unknown>[]) || [];
  } catch {
    rows = [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <AdminOpsNav adminKey={key!} current="select" />
      <h1 className="mt-8 text-2xl font-bold text-white">RAIN Select applications</h1>
      <p className="mt-2 text-sm text-slate-400">
        Human review only. Do not tell anyone they are selected until you submit
        a decision here.{" "}
        <a
          className="text-aqua hover:text-aqua-bright"
          href={`/admin/select-funnel?key=${encodeURIComponent(key!)}`}
        >
          Funnel
        </a>
      </p>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          No applications yet, or the rain_select_applications table is not
          migrated.
        </p>
      ) : (
        <ul className="mt-8 space-y-6">
          {rows.map((row) => (
            <li
              key={String(row.id)}
              className="rounded-2xl border border-white/10 bg-night-800/80 p-4 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-white">
                  {String(row.company_name || row.email)}
                </p>
                <p className="text-xs uppercase tracking-wider text-aqua">
                  {String(row.selection_status)} · v{String(row.variant || "").toUpperCase()}
                </p>
              </div>
              <p className="mt-1 text-slate-300">
                {String(row.first_name || "")} {String(row.last_name || "")} ·{" "}
                {String(row.email)} · {String(row.role || "")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {String(row.company_url || "")} · {String(row.revenue_range || "")} ·
                pipeline {String(row.pipeline_range || "n/a")} · cycle{" "}
                {String(row.sales_cycle || "n/a")}
              </p>
              {row.suspected_constraint ? (
                <p className="mt-3 text-slate-300">
                  Constraint: {String(row.suspected_constraint)}
                </p>
              ) : null}
              {row.thirty_day_goal ? (
                <p className="mt-1 text-slate-400">
                  30 days: {String(row.thirty_day_goal)}
                </p>
              ) : null}
              <SelectDecisionForm id={String(row.id)} adminKey={key!} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
