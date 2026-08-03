import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout complete — Make it RAIN" };

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { session_id: sessionId } = await searchParams;
  if (!sessionId) {
    redirect("/pricing?checkout=canceled");
  }

  let status: string | null = null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    status = session.status;
  } catch (err) {
    console.error("[checkout/return]", err);
  }

  const complete = status === "complete";

  if (complete) {
    // Soft landing then dashboard — webhook may still be catching up.
    redirect("/dashboard?checkout=success");
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <Logo href="/dashboard" />
      <div className="mt-10 w-full max-w-md rounded-2xl border border-night-600 bg-night-800 p-8 text-center">
        {status === "open" ? (
          <>
            <XCircle className="mx-auto text-amber-400" size={36} />
            <h1 className="mt-4 text-xl font-bold text-white">Checkout incomplete</h1>
            <p className="mt-2 text-sm text-slate-400">
              Your payment wasn&apos;t finished. You can try again anytime.
            </p>
            <Link href="/pricing" className="btn-primary mt-6 inline-flex">
              Back to plans
            </Link>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto text-aqua-bright" size={36} />
            <h1 className="mt-4 text-xl font-bold text-white">Almost there</h1>
            <p className="mt-2 text-sm text-slate-400">
              We couldn&apos;t confirm the session yet. If you paid, open the
              dashboard — your trial should appear in a moment.
            </p>
            <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
