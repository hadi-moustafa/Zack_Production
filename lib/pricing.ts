import type { PricingPackage, PricingSection } from "@/lib/types";

export type PricingGroup = {
  name: string;
  /** Cards for items that list what's included; a price list otherwise. */
  layout: "cards" | "list";
  items: PricingPackage[];
};

/**
 * Splits the price list into its two halves, each made of named groups, in
 * admin order. Rows without a group (the pre-2026-10 starter list) are skipped
 * so placeholder prices can never show.
 */
export function groupPricing(rows: PricingPackage[]): Record<PricingSection, PricingGroup[]> {
  const result: Record<PricingSection, PricingGroup[]> = { packages: [], singles: [] };
  const sorted = [...rows].filter((r) => r.group_name?.trim() && r.name.trim()).sort((a, b) => a.sort_order - b.sort_order);

  for (const row of sorted) {
    const section: PricingSection = row.section === "singles" ? "singles" : "packages";
    let group = result[section].find((g) => g.name === row.group_name);
    if (!group) {
      group = { name: row.group_name, layout: "list", items: [] };
      result[section].push(group);
    }
    group.items.push(row);
    if (row.features.length > 0) group.layout = "cards";
  }
  return result;
}

export function priceLabel(price: string, layout: PricingGroup["layout"]) {
  if (price.trim()) return price.trim();
  return layout === "cards" ? "Price on request" : "On request";
}
