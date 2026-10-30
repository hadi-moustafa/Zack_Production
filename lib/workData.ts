import { cache } from "react";
import { supabasePublic } from "@/lib/supabasePublic";
import { buildGroups } from "@/lib/work";
import type { Category, Photo } from "@/lib/types";

// The portfolio grouped by visible, non-empty category, for the /work pages,
// the sitemap and llms.txt. Cached per request so a page, its metadata and
// its structured data share one round trip.
export const getWorkGroups = cache(async () => {
  const [photosRes, categoriesRes] = await Promise.all([
    supabasePublic.from("photos").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("categories").select("*").order("sort_order", { ascending: true }),
  ]);
  return buildGroups((photosRes.data ?? []) as Photo[], (categoriesRes.data ?? []) as Category[]);
});
