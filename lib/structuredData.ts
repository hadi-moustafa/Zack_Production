import { site, absoluteUrl } from "@/lib/site";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { photoPublicUrl } from "@/lib/media";
import type { SiteData } from "@/lib/siteData";
import type { Group } from "@/lib/work";

// All schema.org data for the site is built here, so the business details
// in search results always match what the pages say.

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;
const FOUNDER_ID = `${site.url}/#founder`;

/** Zack, as one Person node: the organization's founder and the /about page's subject. */
function founder(data: SiteData) {
  const { content, socialLinks } = data;
  const photo = content[SECTION_PHOTO_KEYS.about];
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: content.about_name || site.founder,
    jobTitle: content.about_roles.split("·")[0]?.trim() || "Director of Photography",
    worksFor: { "@id": ORG_ID },
    url: absoluteUrl("/about"),
    ...(photo ? { image: photoPublicUrl(photo) } : {}),
    ...(content.about_award ? { award: content.about_award } : {}),
    ...(socialLinks.length ? { sameAs: socialLinks.map((l) => l.url) } : {}),
  };
}

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
        founder: { "@id": FOUNDER_ID },
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
      founder(data),
    ],
  };
}

/** /about: the page, about Zack. */
export function aboutPage(data: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: absoluteUrl("/about"),
    name: `About ${data.content.about_name || site.founder}`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": FOUNDER_ID },
  };
}

/** /work/[category]: the collection, and each film with a preview frame as a VideoObject. */
export function categoryPage(group: Group, description: string) {
  const path = `/work/${group.category.slug}`;
  const videos = group.films
    .filter((f) => f.still)
    .map((f, i) => ({
      "@type": "VideoObject",
      name: f.caption || `${group.category.name} film ${i + 1} by ${site.name}`,
      description: f.label,
      thumbnailUrl: f.still,
      contentUrl: f.src,
      uploadDate: f.createdAt,
      creator: { "@id": ORG_ID },
    }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: absoluteUrl(path),
        name: `${group.category.name} by ${site.name}`,
        description,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        ...(videos.length ? { hasPart: videos } : {}),
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
