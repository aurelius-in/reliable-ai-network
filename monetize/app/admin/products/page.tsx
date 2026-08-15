import { Logo } from "@/components/Logo";
import { ProductsReview } from "@/components/admin/ProductsReview";
import { assertAdminSecret } from "@/lib/admin-auth";
import { loadAdminProductSubmissions } from "@/lib/admin-products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Product submissions — Make it RAIN" };

type SearchParams = Promise<{ key?: string; limit?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key, limit: limitRaw } = await searchParams;
  const gate = assertAdminSecret(key);
  const limit = Math.min(
    200,
    Math.max(1, Number.parseInt(limitRaw || "80", 10) || 80)
  );

  if (!gate.ok) {
    return (
      <Shell>
        <div className="rounded-2xl border border-night-600 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Product submissions</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">
              /admin/products?key=YOUR_SECRET
            </code>
          </p>
        </div>
      </Shell>
    );
  }

  const result = await loadAdminProductSubmissions(limit);

  if ("error" in result) {
    return (
      <Shell>
        <div className="rounded-2xl border border-red-500/30 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Could not load</h1>
          <p className="mt-2 text-sm text-red-300">{result.error}</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <ProductsReview
        submissions={result.submissions}
        total={result.total}
        adminKey={key!}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-night-950 px-4 py-8 text-slate-100">
      <div className="mx-auto mb-8 flex max-w-5xl justify-center">
        <Logo href="/" />
      </div>
      <div className="mx-auto flex max-w-5xl justify-center">{children}</div>
    </div>
  );
}
