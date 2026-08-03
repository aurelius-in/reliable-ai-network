import { Suspense } from "react";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";

export const metadata = { title: "Unsubscribe — Make it RAIN" };

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-400">
          Loading…
        </div>
      }
    >
      <UnsubscribeForm />
    </Suspense>
  );
}
