export type Photo = {
  id: string;
  storage_path: string;
  category: string;
  caption: string;
  sort_order: number;
  media_type: "photo" | "video";
  created_at: string;
};

export type PricingPackage = {
  id: string;
  name: string;
  price: string;
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
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
};
