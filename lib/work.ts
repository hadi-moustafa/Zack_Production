import { photoPublicUrl, workAlt } from "@/lib/media";
import { byOrder } from "@/lib/categories";
import type { Category, Photo } from "@/lib/types";

// Shapes the gallery (visible categories with their films and photos) for
// both designs. Plain functions, so server components can use them too.

export type Item = {
  id: string;
  kind: "photo" | "video";
  src: string;
  /** Still image to show: the photo itself, or a film's preview frame. */
  still?: string;
  blur?: string;
  width: number;
  height: number;
  caption: string;
  featured: boolean;
  category: Category;
  label: string;
};

export type Group = {
  category: Category;
  films: Item[];
  photos: Item[];
  cover?: Item;
};

function toItem(p: Photo, category: Category): Item {
  const isVideo = p.media_type === "video";
  return {
    id: p.id,
    kind: isVideo ? "video" : "photo",
    src: photoPublicUrl(p.storage_path),
    still: isVideo ? (p.poster_path ? photoPublicUrl(p.poster_path) : undefined) : photoPublicUrl(p.storage_path),
    blur: p.blur_data ?? undefined,
    width: p.width ?? (isVideo ? 720 : 1600),
    height: p.height ?? (isVideo ? 1280 : 2000),
    caption: p.caption.trim(),
    featured: p.featured,
    category,
    label: workAlt(category.name, isVideo ? "video" : "photo", p.caption),
  };
}

export function plural(n: number, word: string, many = `${word}s`) {
  return `${n} ${n === 1 ? word : many}`;
}

export function countLabel(g: { films: unknown[]; photos: unknown[] }) {
  return [g.films.length ? plural(g.films.length, "film") : "", g.photos.length ? plural(g.photos.length, "photo") : ""]
    .filter(Boolean)
    .join(" · ");
}

/** Your ★ picks; if fewer than a handful, a balanced pick from every category. */
export function pickHighlights(groups: Group[], kind: "films" | "photos", max: number, perCategory: number) {
  const starred = groups.flatMap((g) => g[kind].filter((i) => i.featured));
  if (starred.length >= Math.min(4, max)) return starred.slice(0, max);
  const picks = [...starred];
  for (let round = 0; picks.length < max && round < perCategory; round++) {
    for (const g of groups) {
      const next = g[kind].filter((i) => !i.featured)[round];
      if (next && picks.length < max) picks.push(next);
    }
  }
  return picks;
}

/** Visible categories with their films, photos and cover, in admin order; empty ones dropped. */
export function buildGroups(photos: Photo[], categories: Category[]): Group[] {
  const visible = categories.filter((c) => c.visible).sort(byOrder);
  const ordered = [...photos].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);
  return visible
    .map((category) => {
      const mine = ordered.filter((p) => p.category_id === category.id).map((p) => toItem(p, category));
      const films = mine.filter((i) => i.kind === "video" && category.kind !== "photo");
      const stills = mine.filter((i) => i.kind === "photo" && category.kind !== "video");
      const chosen = category.cover_path ? mine.find((i) => i.still?.endsWith(category.cover_path!)) : undefined;
      const custom: Item | undefined =
        category.cover_path && !chosen
          ? { ...(mine[0] ?? ({} as Item)), still: photoPublicUrl(category.cover_path), blur: undefined }
          : chosen;
      return { category, films, photos: stills, cover: custom ?? stills[0] ?? films.find((f) => f.still) };
    })
    .filter((g) => g.films.length + g.photos.length > 0);
}
