import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type ServerClient = ReturnType<typeof createServerClient>;

/**
 * Before Supabase env vars are configured, behave as a signed-out session
 * so public pages render instead of crashing with a 500.
 */
const stubClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
  },
} as unknown as ServerClient;

/**
 * Server-side Supabase client bound to the current request's cookies.
 * Only call inside Server Components, Route Handlers, or Server Actions.
 */
export async function createClient(): Promise<ServerClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return stubClient;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component: cookie writes are handled by middleware.
          }
        },
      },
    }
  );
}
