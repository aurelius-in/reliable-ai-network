import { Logo } from "@/components/Logo";
import { ReviewsAdmin } from "@/components/admin/ReviewsAdmin";
import { assertAdminSecret } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review moderation — Make it RAIN" };

type SearchParams = Promise<{ key?: string }>;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { key } = await searchParams;
  const gate = assertAdminSecret(key);

  if (!gate.ok) {
    return (
      <Shell>
        <div className="rounded-2xl border border-night-600 bg-night-800 p-8 text-center">
          <h1 className="text-xl font-bold text-white">Review moderation</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">
              /admin/reviews?key=YOUR_SECRET
            </code>
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mb-6 text-2xl font-black text-white">Review moderation</h1>
      <ReviewsAdmin adminKey={key!} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <Logo />
      <div className="mt-8 w-full max-w-3xl">{children}</div>
    </div>
  );
}
