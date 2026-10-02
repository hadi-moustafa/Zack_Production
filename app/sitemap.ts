import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

// Every indexable page. /thank-you and the admin are noindex (via their
// metadata, not robots.txt, so crawlers can see that), so they're left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/privacy"), lastModified: site.privacyUpdated, changeFrequency: "yearly", priority: 0.2 },
  ];
}
