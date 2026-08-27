import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminSecret } from "@/lib/admin-auth";
import { AdminOpsNav } from "@/components/admin/AdminOpsNav";
import { SELECT_VARIANTS } from "@/rain-select/config";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ key?: string }>;

export default async function SelectFunnelPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key } = await searchParams;
  const gate = assertAdminSecret(key);
  if (!gate.ok) {
    return (
      <div className="px-4 py-16 text-center text-slate-400">
        Add ?key= to open the RAIN Select funnel.
      </div>
    );
  }

  type Row = {
    variant: string;
    preview: boolean;
    selection_status: string;
    created_at: string;
  };
  let rows: Row[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("rain_select_applications")
      .select("variant, preview, selection_status, created_at");
    rows = ((data as Row[]) || []).filter((r) => !r.preview);
  } catch {
    rows = [];
  }

  const counts = SELECT_VARIANTS.map((v) => {
    const slice = rows.filter((r) => r.variant === v);
    const submitted = slice.filter((r) =>
      [
        "submitted",
        "under_review",
        "selected",
        "not_selected_yet",
        "better_fit_other_path",
        "qualified_capacity_full",
        "accepted",
        "paid",
      ].includes(r.selection_status)
    ).length;
    const selected = slice.filter((r) =>
      ["selected", "accepted", "paid"].includes(r.selection_status)
    ).length;
    const paid = slice.filter((r) => r.selection_status === "paid").length;
    return {
      variant: v.toUpperCase(),
      emails: slice.length,
      submitted,
      selected,
      paid,
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <AdminOpsNav adminKey={key!} current="select" />
      <h1 className="mt-8 text-2xl font-bold text-white">RAIN Select funnel</h1>
      <p className="mt-2 text-sm text-slate-400">
        Do not pick a winner on click rate. Primary: selected applications per
        visitor. Until paid data exists, use selected / email.
      </p>
      <table className="mt-8 w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="py-2">Variant</th>
            <th className="py-2">Emails</th>
            <th className="py-2">Submitted</th>
            <th className="py-2">Selected</th>
            <th className="py-2">Paid</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((c) => (
            <tr key={c.variant} className="border-t border-white/10">
              <td className="py-2 text-white">{c.variant}</td>
              <td className="py-2">{c.emails}</td>
              <td className="py-2">{c.submitted}</td>
              <td className="py-2">{c.selected}</td>
              <td className="py-2">{c.paid}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 text-xs text-slate-500">
        Preview traffic is excluded. Unique visitor counts come from
        select_page_view events after the analytics table is populated.
      </p>
    </div>
  );
}
