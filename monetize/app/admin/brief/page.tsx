import { Logo } from "@/components/Logo";
import { FounderBriefForm } from "@/components/admin/FounderBriefForm";
import { assertAdminSecret } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Founder Brief: Make it RAIN" };

type SearchParams = Promise<{ key?: string }>;

export default async function AdminBriefPage({
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
          <h1 className="text-xl font-bold text-white">Founder Brief</h1>
          <p className="mt-2 text-sm text-slate-400">
            Add your admin key to the URL:
            <br />
            <code className="mt-2 inline-block text-rain-bright">
              /admin/brief?key=YOUR_SECRET
            </code>
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Never share this URL in DMs. Paste product URLs here, then send the
            public /r/ link to the founder.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <FounderBriefForm adminKey={key!} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <Logo />
      <div className="mt-8 w-full max-w-2xl">{children}</div>
    </div>
  );
}
