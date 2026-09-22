// Central list of editable page_content keys, their admin-form grouping, and
// sane fallback defaults used when a key hasn't been set yet.

export type ContentField = {
  key: string;
  label: string;
  group: "Brand" | "Hero" | "About" | "Pricing" | "Contact & Footer";
  multiline?: boolean;
  placeholder?: string;
};

export const CONTENT_FIELDS: ContentField[] = [
  { key: "photographer_name", label: "Photographer / brand name", group: "Brand", placeholder: "Zack" },
  { key: "brand_subtitle", label: "Brand subtitle (under logo)", group: "Brand", placeholder: "PRODUCTION" },
  { key: "location_text", label: "Location (city, country)", group: "Brand", placeholder: "City, Country" },

  { key: "hero_headline", label: "Hero headline", group: "Hero", placeholder: "Real Moments" },
  { key: "hero_tagline", label: "Hero description", group: "Hero", multiline: true, placeholder: "A short line about your photography style and what clients can expect." },
  { key: "hero_script_tagline", label: "Hero script tagline", group: "Hero", placeholder: "Every frame tells a story" },
  { key: "capability_words", label: "Capability words (dot-separated)", group: "Hero", placeholder: "Photos · Videos · Stories" },
  { key: "signature_credit", label: "Signature credit", group: "Hero", placeholder: "— Zack" },

  { key: "about_bio", label: "About bio", group: "About", multiline: true, placeholder: "Write a couple of short paragraphs about yourself and your work." },
  { key: "about_photo_caption", label: "About photo caption (vertical script)", group: "About", placeholder: "Behind the lens" },

  { key: "pricing_description", label: "Pricing section description", group: "Pricing", multiline: true, placeholder: "Choose the package that fits your needs, or get in touch for something custom." },

  { key: "contact_description", label: "Contact section description", group: "Contact & Footer", multiline: true, placeholder: "Have a project in mind? Reach out and let's talk." },
  { key: "contact_phone", label: "Contact phone", group: "Contact & Footer", placeholder: "+1 234 567 8900" },
  {
    key: "whatsapp_number",
    label: "WhatsApp number (receives contact form messages)",
    group: "Contact & Footer",
    placeholder: "+961 71 413 009",
  },
  { key: "footer_email", label: "Contact email", group: "Contact & Footer", placeholder: "you@example.com" },
  { key: "footer_tagline", label: "Footer tagline", group: "Contact & Footer", placeholder: "Capturing real moments, one frame at a time." },
];

// Which uploaded photo (by storage_path) backs each section's background image.
// Stored in page_content like everything else, but picked from the Photos
// manager rather than typed in as text.
export const SECTION_PHOTO_KEYS = {
  hero: "hero_photo_path",
  about: "about_photo_path",
  contact: "contact_photo_path",
} as const;

export const CONTENT_DEFAULTS: Record<string, string> = {
  ...Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, f.placeholder ?? ""])),
  ...Object.fromEntries(Object.values(SECTION_PHOTO_KEYS).map((key) => [key, ""])),
};

export function withDefaults(content: Record<string, string>): Record<string, string> {
  return { ...CONTENT_DEFAULTS, ...content };
}
