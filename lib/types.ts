export type Photo = {
  id: string;
  storage_path: string;
  /** Legacy free-text category, kept only for history; use category_id. */
  category: string;
  /** Null = a site image (hero/about/contact), never shown in the gallery. */
  category_id: string | null;
  caption: string;
  sort_order: number;
  media_type: "photo" | "video";
  /** Still frame shown for a video until it's played (null until generated). */
  poster_path?: string | null;
  /** Real pixel size, so layouts reserve the right shape before loading. */
  width: number | null;
  height: number | null;
  /** Tiny base64 image shown blurred while the real one loads. */
  blur_data: string | null;
  /** ★ items come first in "All". */
  featured: boolean;
  created_at: string;
};

export type CategoryKind = "photo" | "video" | "both";

export type Category = {
  id: string;
  name: string;
  slug: string;
  /** Short line shown under the title, e.g. "Birthdays, gender reveals and more". */
  description: string;
  /** Which part of Work it appears in: Photos, Films, or both. */
  kind: CategoryKind;
  /** Chip thumbnail; falls back to the category's first item. */
  cover_path: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
};

export type PricingSection = "packages" | "singles";

export type PricingPackage = {
  id: string;
  /** Which half of the pricing section it sits in. */
  section: PricingSection;
  /** Heading it's grouped under, e.g. "Wedding Packages". */
  group_name: string;
  name: string;
  /** Display price, e.g. "$150". Blank means "price on request". */
  price: string;
  /** What's included; items with any are shown as cards, others as list rows. */
  features: string[];
  /** Optional label, e.g. "Recommended" or "Up to 20% off". */
  badge: string;
  /** Gold border and a ribbon for the badge: the item to steer people to. */
  highlighted: boolean;
  sort_order: number;
  created_at: string;
};

export type PageContent = {
  key: string;
  value: string;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
};

export type ClientKind = "brand" | "person";

/** A brand or well-known person we've worked with (shown by the Headliner design). */
export type Client = {
  id: string;
  name: string;
  kind: ClientKind;
  /** e.g. "Singer", "Grand opening" — optional. */
  role: string;
  /** Logo (brands) or photo (people), in the photos bucket. */
  image_path: string | null;
  /** Draw the logo as a plain white silhouette (best for transparent logos). */
  logo_mono: boolean;
  /** Optional link: their profile, or the film we made with them. */
  url: string;
  sort_order: number;
  visible: boolean;
  created_at: string;
};
