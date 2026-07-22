import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ key?: string }>;

/** Old signup counter URL → Counter. */
export default async function AdminSignupsRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key } = await searchParams;
  const qs = key ? `?key=${encodeURIComponent(key)}` : "";
  redirect(`/admin/counter${qs}`);
}
