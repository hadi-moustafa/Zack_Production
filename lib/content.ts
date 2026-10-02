// Central list of editable page_content keys and their admin-form grouping.
// `placeholder` is only a hint shown in the empty admin input. `fallback` is
// real copy used on the site when a key hasn't been set; fields without one
// (contact details, bio) render nothing until filled in, so no placeholder
// text can ever reach the public site.

export type ContentField = {
  key: string;
  label: string;
  group: "Brand" | "Hero" | "About" | "Pricing" | "Contact & Footer";
  multiline?: boolean;
  placeholder?: string;
  fallback?: string;
};

export const CONTENT_FIELDS: ContentField[] = [
  { key: "photographer_name", label: "Photographer first name", group: "Brand", placeholder: "Zack", fallback: "Zack" },

  { key: "hero_headline", label: "Hero headline", group: "Hero", placeholder: "Real Moments", fallback: "Real Moments" },
  { key: "hero_tagline", label: "Hero description", group: "Hero", multiline: true, placeholder: "Capturing moments that last a lifetime", fallback: "Capturing moments that last a lifetime" },

  { key: "about_bio", label: "About bio", group: "About", multiline: true, placeholder: "A couple of short paragraphs about yourself and your work." },
  { key: "about_photo_caption", label: "About photo caption", group: "About", placeholder: "Behind the lens" },

  { key: "pricing_description", label: "Pricing section description", group: "Pricing", multiline: true, placeholder: "Choose the package that fits your needs, or get in touch for something custom.", fallback: "Choose the package that fits your needs, or get in touch for something custom." },

  { key: "contact_description", label: "Contact section description", group: "Contact & Footer", multiline: true, placeholder: "Have a project in mind? Reach out and let's talk.", fallback: "Have a project in mind? Reach out and let's talk." },
  { key: "contact_phone", label: "Contact phone", group: "Contact & Footer", placeholder: "+961 71 413 009" },
  {
    key: "whatsapp_number",
    label: "WhatsApp number (receives contact form messages)",
    group: "Contact & Footer",
    placeholder: "+961 71 413 009",
  },
  { key: "footer_email", label: "Contact email", group: "Contact & Footer", placeholder: "name@example.com" },
  { key: "footer_tagline", label: "Footer tagline", group: "Contact & Footer", placeholder: "We Entertain People.", fallback: "We Entertain People." },
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
  ...Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, f.fallback ?? ""])),
  ...Object.fromEntries(Object.values(SECTION_PHOTO_KEYS).map((key) => [key, ""])),
};

export function withDefaults(content: Record<string, string>): Record<string, string> {
  const merged: Record<string, string> = { ...CONTENT_DEFAULTS };
  for (const [key, value] of Object.entries(content)) {
    const trimmed = value.trim();
    // A blank (or punctuation-only, e.g. ".") value means "not written yet":
    // keep the real fallback copy, or nothing, rather than showing it.
    merged[key] = /[\p{L}\p{N}]/u.test(trimmed) ? trimmed : (CONTENT_DEFAULTS[key] ?? "");
  }
  return merged;
}
