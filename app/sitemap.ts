import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";
import { getWorkGroups } from "@/lib/workData";

// Every indexable page. /thank-you and the admin are noindex (via their
// metadata, not robots.txt, so crawlers can see that), so they're left out.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const groups = await getWorkGroups();
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/work"), changeFrequency: "weekly", priority: 0.9 },
    ...groups.map((g) => ({ url: absoluteUrl(`/work/${g.category.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/clients"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), lastModified: site.privacyUpdated, changeFrequency: "yearly", priority: 0.2 },
  ];
}
