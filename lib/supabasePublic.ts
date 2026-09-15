import { createClient } from "@supabase/supabase-js";

// Anon, sessionless client for public (unauthenticated) reads in Server Components.
// Safe to use on the server or client — relies entirely on RLS public-read policies.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } }
);
