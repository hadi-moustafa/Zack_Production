export type Photo = {
  id: string;
  storage_path: string;
  category: string;
  caption: string;
  sort_order: number;
  media_type: "photo" | "video";
  /** Still frame shown for a video until it's played (null until generated). */
  poster_path?: string | null;
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
