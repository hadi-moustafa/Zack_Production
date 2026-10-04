import { supabasePublic } from "@/lib/supabasePublic";
import { getSiteData } from "@/lib/siteData";
import { getLatestInstagramReel } from "@/lib/instagram";
import { getClients } from "@/lib/clients";
import type { Category, Photo, PricingPackage } from "@/lib/types";

// Everything the home page shows, in one round of parallel queries. Shared by
// both designs (and the design preview), so they always show the same content.
export async function getHomeData() {
  const [photosRes, categoriesRes, pricingRes, clients, siteData, instagramReel] = await Promise.all([
    supabasePublic.from("photos").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("categories").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("pricing_packages").select("*").order("sort_order", { ascending: true }),
    getClients(),
    getSiteData(),
    getLatestInstagramReel(),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  const categories = (categoriesRes.data ?? []) as Category[];
  const pricingPackages = (pricingRes.data ?? []).map((p) => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
  })) as PricingPackage[];

  return { photos, categories, pricingPackages, clients, siteData, instagramReel };
}

export type HomeData = Awaited<ReturnType<typeof getHomeData>>;
