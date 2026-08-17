import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeInternalNext } from "@/lib/safe-next";

const PROTECTED_PREFIXES = ["/dashboard", "/billing", "/onboarding"];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without Supabase configured we can't check sessions; let requests through.
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refreshes the session token if expired; required for SSR auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Legacy reviewer links used ?access=RAIN26ADMIN (looks like an admin secret).
  // Send them to the dedicated invite page with an opaque path.
  const accessParam =
    request.nextUrl.searchParams.get("access") ||
    request.nextUrl.searchParams.get("code");
  if (
    accessParam &&
    accessParam.trim().toUpperCase() === "RAIN26ADMIN" &&
    !pathname.startsWith("/invite")
  ) {
    const inviteUrl = request.nextUrl.clone();
    inviteUrl.pathname = "/invite/reviewer";
    inviteUrl.search = "";
    return NextResponse.redirect(inviteUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const intended = safeInternalNext(
      request.nextUrl.searchParams.get("next"),
      ""
    );
    if (intended) {
      const dest = new URL(intended, request.url);
      const invite = request.nextUrl.searchParams.get("invite");
      if (invite && !dest.searchParams.get("invite")) {
        dest.searchParams.set("invite", invite);
      }
      return NextResponse.redirect(dest);
    }
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    // Preserve invite/access so logged-in reviewers still redeem.
    const invite = request.nextUrl.searchParams.get("invite");
    const access = request.nextUrl.searchParams.get("access");
    dashUrl.search = "";
    if (invite) dashUrl.searchParams.set("invite", invite);
    if (access) dashUrl.searchParams.set("access", access);
    return NextResponse.redirect(dashUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|offline\\.html|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
