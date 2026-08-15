import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ReviewsPanel } from "@/components/ReviewsPanel";

export const metadata = {
  title: "Reviews — Make it RAIN",
  description:
    "Read and leave reviews of Make it RAIN: monetization for software and AI founders.",
};

export default function ReviewsPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo href="/" />
          <Link
            href="#leave-review"
            className="text-sm font-semibold text-aqua hover:text-aqua-bright"
          >
            Leave a review
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black text-white">Reviews</h1>
        <p className="mt-2 text-sm text-slate-400">
          Honest notes from founders who tried Make it RAIN. Want to add yours?
          Scroll to Leave a review — or use the button on the homepage.
        </p>
        <div className="mt-8">
          <ReviewsPanel />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
