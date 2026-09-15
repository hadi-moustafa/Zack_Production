import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Use inside Server Components, Route Handlers, and Server Actions.
// Reads/writes the Supabase auth session from cookies so RLS policies
// that check auth.role() work the same as they do in the browser.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component without a mutable
          // response (e.g. during render) — safe to ignore, middleware
          // refreshes the session on the next request.
        }
      },
    },
  });
}
