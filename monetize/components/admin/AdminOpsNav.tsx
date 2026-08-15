import Link from "next/link";

export type AdminOpsNavCurrent = "activity" | "products" | "brief";

/**
 * Shareable ops strip. Never links to /admin/counter (emails / founder-only “fake” signals).
 */
export function AdminOpsNav({
  adminKey,
  current,
  range = "7d",
}: {
  adminKey: string;
  current: AdminOpsNavCurrent;
  /** Passed through to Activity so range survives tab switches. */
  range?: string;
}) {
  const key = encodeURIComponent(adminKey);
  const items: { id: AdminOpsNavCurrent; label: string; href: string }[] = [
    {
      id: "activity",
      label: "Activity",
      href: `/admin/activity?key=${key}&range=${encodeURIComponent(range)}`,
    },
    {
      id: "products",
      label: "Submissions",
      href: `/admin/products?key=${key}`,
    },
    {
      id: "brief",
      label: "Brief Gen",
      href: `/admin/brief?key=${key}`,
    },
  ];

  return (
    <nav
      className="flex flex-wrap justify-center gap-2"
      aria-label="Admin ops"
    >
      {items.map((item) => {
        const active = item.id === current;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-rain/20 text-rain-bright ring-1 ring-rain/50"
                : "bg-night-800 text-slate-400 ring-1 ring-night-600 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
