// Pure URL helpers for uploaded media. Kept free of the Supabase client so
// public components can use them without pulling the SDK into the bundle.

export const PHOTOS_BUCKET = "photos";

export function photoPublicUrl(storagePath: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTOS_BUCKET}/${storagePath}`;
}

const CATEGORY_NOUN: Record<string, string> = {
  Weddings: "Wedding",
  Graduations: "Graduation",
  Promotions: "Promotional",
};

/** Alt text for a portfolio item that has no caption of its own. */
export function workAlt(category: string, kind: "photo" | "video", caption?: string) {
  if (caption?.trim()) return caption.trim();
  const noun = CATEGORY_NOUN[category] ?? category;
  return `${noun} ${kind === "video" ? "film" : "photography"} by Zack Production`;
}
