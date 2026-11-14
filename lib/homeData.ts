import { supabasePublic } from "@/lib/supabasePublic";
import { getSiteData } from "@/lib/siteData";
import { getLatestInstagramReel } from "@/lib/instagram";
import { getClients } from "@/lib/clients";
import { getPricingPackages } from "@/lib/pricingData";
import type { Category, Photo } from "@/lib/types";

// Everything the home page shows, in one round of parallel queries. Shared by
// both designs (and the design preview), so they always show the same content.
export async function getHomeData() {
  const [photosRes, categoriesRes, pricingPackages, clients, siteData, instagramReel] = await Promise.all([
    supabasePublic.from("photos").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("categories").select("*").order("sort_order", { ascending: true }),
    getPricingPackages(),
    getClients(),
    getSiteData(),
    getLatestInstagramReel(),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  const categories = (categoriesRes.data ?? []) as Category[];

  return { photos, categories, pricingPackages, clients, siteData, instagramReel };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
