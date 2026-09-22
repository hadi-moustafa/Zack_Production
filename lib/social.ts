import type { SocialLink } from "@/lib/types";

// Canonical list of platforms the admin can set a link for, and the order
// they're shown in the dashboard. Public rendering (SocialLinks.tsx) shows
// whatever platforms have a non-empty url, regardless of this list.
export const SOCIAL_PLATFORMS = ["instagram", "facebook", "tiktok", "whatsapp", "youtube", "twitter"] as const;

export const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
  twitter: "X / Twitter",
};

export const SOCIAL_PLACEHOLDERS: Record<string, string> = {
  instagram: "https://instagram.com/yourname",
  facebook: "https://facebook.com/yourpage",
  tiktok: "https://tiktok.com/@yourname",
  whatsapp: "https://wa.me/1234567890",
  youtube: "https://youtube.com/@yourname",
  twitter: "https://x.com/yourname",
};

// Fills in every canonical platform (even ones with no row in the database
// yet) so the admin dashboard always has a field to enter a link for.
export function withSocialDefaults(links: SocialLink[]): SocialLink[] {
  const byPlatform = new Map(links.map((l) => [l.platform, l.url]));
  return SOCIAL_PLATFORMS.map((platform) => ({ platform, url: byPlatform.get(platform) ?? "" }));
}
