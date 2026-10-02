// Static, site-wide constants: the single source of truth for anything that
// isn't edited from the admin dashboard. Admin-editable details (phone,
// WhatsApp, email, social links, page copy) come from `getSiteData()` in
// lib/siteData.ts instead, so nothing here duplicates them.

export const site = {
  /** Canonical origin. The apex domain 308-redirects here. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.zackproduction.com").replace(/\/$/, ""),
  name: "Zack Production",
  founder: "Zack Ghosson",
  description:
    "Zack Production films and photographs weddings, graduations, food and brand promotions across Lebanon. Real moments, cinematic edits.",
  locale: "en_US",
  location: {
    city: "Beirut",
    country: "Lebanon",
    countryCode: "LB",
  },
  responseTime: "within 24 hours",
  /** The categories of work Zack offers, in the order they're presented. */
  services: ["Weddings", "Graduations", "Food", "Promotions"],
  theme: {
    background: "#0a0a0a",
  },
  credit: {
    name: "SE HM",
    phone: "+961 81 277281",
  },
  /** Date the privacy policy text was last changed. */
  privacyUpdated: "2026-10-02",
} as const;

/** Open Graph fields every page shares; pages spread this and add their `url`. */
export const baseOpenGraph = {
  type: "website" as const,
  siteName: site.name,
  locale: site.locale,
};

export const locationLabel = `${site.location.city}, ${site.location.country}`;

export const responsePromise = `We reply ${site.responseTime}.`;

export function absoluteUrl(path = "/") {
  return `${site.url}${path === "/" ? "/" : path}`;
}

/** Sections of the one-page site, used by the nav, footer and llms.txt. */
export const SECTIONS = [
  { id: "about", label: "Who I Am", description: "Meet Zack, the photographer and filmmaker behind Zack Production" },
  { id: "gallery", label: "Work", description: "Wedding, graduation, food and promotional photography and films" },
  { id: "pricing", label: "Pricing", description: "Photography and film packages" },
  { id: "contact", label: "Contact", description: "Book a shoot or ask a question" },
] as const;
