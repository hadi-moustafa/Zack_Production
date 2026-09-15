import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

const PHOTOS_BUCKET = "photos";

export function photoPublicUrl(storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${PHOTOS_BUCKET}/${storagePath}`;
}

export { PHOTOS_BUCKET };
