import { createServerSupabaseClient } from "@/lib/supabaseServer";

// Verifies the request carries a valid Supabase auth session.
// Returns the authenticated Supabase client, or null if there is no session
// (route handlers should respond with 401 in that case).
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return supabase;
}
