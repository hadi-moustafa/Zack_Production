import type { Category } from "@/lib/types";

/** URL-safe id for a category name, e.g. "Pre-wedding Films" → "pre-wedding-films". */
export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

export function byOrder<T extends { sort_order: number }>(a: T, b: T) {
  return a.sort_order - b.sort_order;
}

/** Categories that can hold this kind of media. */
export function categoriesFor(categories: Category[], kind: "photo" | "video") {
  return categories.filter((c) => c.kind === "both" || c.kind === kind).sort(byOrder);
}
