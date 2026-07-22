"use client";

/**
 * Fixed bottom navigation bar for phones (< md) — gives the signed-in
 * experience a native-app feel. On the dashboard it drives DashboardTabs
 * through window events (no server round-trip); from other pages it
 * navigates with a ?view= param that DashboardTabs picks up on mount.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleUserRound,
  CreditCard,
  Home,
  ListChecks,
  LogOut,
  PieChart,
  Tags,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { tierLabel } from "@/lib/tiers";

/** MobileTabBar → DashboardTabs: {section: "home" | "tools" | "progress"} */
export const MOBILE_NAV_EVENT = "rain:mobile-nav";
/** DashboardTabs → MobileTabBar: {tab: TabId, sheetOpen: boolean} */
export const TAB_CHANGE_EVENT = "rain:tab-change";

type Section = "home" | "tools" | "progress" | "billing" | "account";

const ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home size={22} /> },
  { id: "tools", label: "Pie", icon: <PieChart size={22} /> },
  { id: "progress", label: "Progress", icon: <ListChecks size={22} /> },
  { id: "billing", label: "Billing", icon: <CreditCard size={22} /> },
  { id: "account", label: "Account", icon: <CircleUserRound size={22} /> },
];

export function MobileTabBar({ tier }: { tier: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dashTab, setDashTab] = useState("analyzer");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    function onTabChange(e: Event) {
      const detail = (e as CustomEvent).detail ?? {};
      if (typeof detail.tab === "string") setDashTab(detail.tab);
      setToolsOpen(!!detail.sheetOpen);
    }
    window.addEventListener(TAB_CHANGE_EVENT, onTabChange);
    return () => window.removeEventListener(TAB_CHANGE_EVENT, onTabChange);
  }, []);

  const onBilling = pathname.startsWith("/billing");
  const active: Section = accountOpen
    ? "account"
    : onBilling
      ? "billing"
      : toolsOpen
        ? "tools"
        : dashTab === "progress"
          ? "progress"
          : "home";

  function press(section: Section) {
    if (section === "account") {
      setAccountOpen((open) => !open);
      return;
    }
    setAccountOpen(false);
    if (section === "billing") {
      if (!onBilling) router.push("/billing");
      return;
    }
    if (!onBilling) {
      window.dispatchEvent(
        new CustomEvent(MOBILE_NAV_EVENT, { detail: { section } })
      );
    } else {
      router.push(
        section === "home" ? "/dashboard" : `/dashboard?view=${section}`
      );
    }
  }

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Account sheet */}
      {accountOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setAccountOpen(false)}
          />
          <div className="sheet-up absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-night-600 bg-night-800 px-5 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-night-600" />
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Account</p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  tier === "pro"
                    ? "bg-violet/15 text-violet-bright ring-1 ring-violet/40"
                    : tier
                      ? "bg-rain/15 text-rain-bright ring-1 ring-rain/40"
                      : "bg-night-600 text-slate-300"
                }`}
              >
                {tierLabel(tier)}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                href="/pricing"
                onClick={() => setAccountOpen(false)}
                className="flex min-h-[52px] items-center gap-3 rounded-xl border border-night-600 bg-night-700 px-4 text-sm font-semibold text-slate-200 transition active:scale-[0.98]"
              >
                <Tags size={18} className="text-rain-bright" /> Plans &amp;
                pricing
              </Link>
              <Link
                href="/billing"
                onClick={() => setAccountOpen(false)}
                className="flex min-h-[52px] items-center gap-3 rounded-xl border border-night-600 bg-night-700 px-4 text-sm font-semibold text-slate-200 transition active:scale-[0.98]"
              >
                <CreditCard size={18} className="text-rain-bright" /> Manage
                billing
              </Link>
              <button
                onClick={signOut}
                disabled={signingOut}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-xl border border-night-600 bg-night-700 px-4 text-sm font-semibold text-red-400 transition active:scale-[0.98] disabled:opacity-60"
              >
                <LogOut size={18} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-night-600/70 bg-night-800/85 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="App navigation"
      >
        <div className="grid grid-cols-5">
          {ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => press(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition active:scale-[0.94] ${
                  isActive ? "text-rain-bright" : "text-slate-500"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "drop-shadow-[0_0_8px_rgba(255,77,158,0.55)]"
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rain-bright shadow-[0_0_6px_rgba(255,77,158,0.9)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
