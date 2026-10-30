import { getSiteData } from "@/lib/siteData";
import { CLIENT_LOGOS } from "@/lib/clientLogos";
import { getWorkGroups } from "@/lib/workData";
import { countLabel } from "@/lib/work";
import { site, absoluteUrl, locationLabel, responsePromise, SECTIONS } from "@/lib/site";

export const revalidate = 3600;

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI
// assistants. Lists every indexable page, like the sitemap.
export async function GET() {
  const [{ contact, socialLinks }, groups] = await Promise.all([getSiteData(), getWorkGroups()]);

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description} Based in ${locationLabel}, run by ${site.founder}.`,
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): Showreel, about Zack, portfolio, packages and the booking form.`,
    ...SECTIONS.map((s) => `  - [${s.label}](${absoluteUrl("/")}#${s.id}): ${s.description}.`),
    `- [Work](${absoluteUrl("/work")}): The full portfolio, by category, with highlight films and stills.`,
    ...groups.map((g) => `  - [${g.category.name}](${absoluteUrl(`/work/${g.category.slug}`)}): ${countLabel(g)}.`),
    `- [About ${site.founder}](${absoluteUrl("/about")}): Biography, roles and awards.`,
    `- [Clients](${absoluteUrl("/clients")}): The ${CLIENT_LOGOS.length} brands, broadcasters and venues ${site.name} has worked with.`,
    `- [Privacy Policy](${absoluteUrl("/privacy")}): What the contact form collects and which services process it.`,
    "",
    "## Services",
    "",
    ...site.services.map((s) => `- ${s} photography and videography`),
    "",
    "## Contact",
    "",
    `- ${responsePromise}`,
    ...(contact.whatsappDigits ? [`- WhatsApp: https://wa.me/${contact.whatsappDigits}`] : []),
    ...(contact.phone ? [`- Phone: ${contact.phone}`] : []),
    ...(contact.email ? [`- Email: ${contact.email}`] : []),
    ...socialLinks.map((l) => `- ${l.platform[0].toUpperCase()}${l.platform.slice(1)}: ${l.url}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
