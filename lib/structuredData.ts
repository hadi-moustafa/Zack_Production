import { site, absoluteUrl } from "@/lib/site";
import type { SiteData } from "@/lib/siteData";

// All schema.org data for the site is built here, so the business details
// in search results always match what the pages say.

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export function organizationGraph(data: SiteData) {
  const { contact, socialLinks } = data;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: site.name,
        url: absoluteUrl("/"),
        description: site.description,
        logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png"), width: 900, height: 336 },
        image: absoluteUrl("/videos/hero-poster.webp"),
        founder: {
          "@type": "Person",
          name: data.content.about_name || site.founder,
          jobTitle: data.content.about_roles.split("·")[0]?.trim() || "Director of Photography",
          ...(data.content.about_award ? { award: data.content.about_award } : {}),
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: site.location.city,
          addressCountry: site.location.countryCode,
        },
        areaServed: { "@type": "Country", name: site.location.country },
        knowsAbout: site.services.map((s) => `${s} photography and videography`),
        slogan: data.content.footer_tagline || undefined,
        ...(contact.phone ? { telephone: contact.phone } : {}),
        ...(contact.email ? { email: contact.email } : {}),
        ...(socialLinks.length ? { sameAs: socialLinks.map((l) => l.url) } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: absoluteUrl("/"),
        name: site.name,
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Serialises JSON-LD safely for a <script> tag (no "</script>" breakouts). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
