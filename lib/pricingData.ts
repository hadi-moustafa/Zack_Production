import { supabasePublic } from "@/lib/supabasePublic";
import type { PricingPackage } from "@/lib/types";

/** The whole price list, in admin order, with older rows' missing fields filled in. */
export async function getPricingPackages(): Promise<PricingPackage[]> {
  const { data } = await supabasePublic.from("pricing_packages").select("*").order("sort_order", { ascending: true });
  return (data ?? []).map((p) => ({
    ...p,
    description: typeof p.description === "string" ? p.description : "",
    features: Array.isArray(p.features) ? p.features : [],
  })) as PricingPackage[];
}
