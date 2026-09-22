// Portfolio items that live as static files in /public rather than in
// Supabase (e.g. category showcase reels, and the wedding photo set),
// merged into the gallery alongside the admin-managed photos.

export type StaticWorkItem =
  | { id: string; kind: "photo"; category: string; src: string; caption?: string }
  | { id: string; kind: "video"; category: string; src: string; caption?: string };

const WEDDING_PHOTO_COUNT = 8;

export const STATIC_WORK_ITEMS: StaticWorkItem[] = [
  ...Array.from({ length: WEDDING_PHOTO_COUNT }, (_, i) => ({
    id: `wedding-photo-${i + 1}`,
    kind: "photo" as const,
    category: "Weddings",
    src: `/gallery/weddings/wedding-${i + 1}.jpg`,
  })),
  {
    id: "wedding-video",
    kind: "video" as const,
    category: "Weddings",
    src: "/videos/work/wedding.mp4",
    caption: "Kassem & Emman",
  },
  {
    id: "food-video",
    kind: "video" as const,
    category: "Food",
    src: "/videos/work/food.mp4",
  },
  {
    id: "promotions-video",
    kind: "video" as const,
    category: "Promotions",
    src: "/videos/work/promotions.mp4",
  },
  {
    id: "graduations-video",
    kind: "video" as const,
    category: "Graduations",
    src: "/videos/work/graduation.mp4",
  },
];
