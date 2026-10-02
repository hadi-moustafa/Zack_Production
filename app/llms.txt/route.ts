import { getSiteData } from "@/lib/siteData";
import { site, absoluteUrl, locationLabel, responsePromise, SECTIONS } from "@/lib/site";

export const revalidate = 3600;

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI
// assistants. Lists every indexable page, like the sitemap.
export async function GET() {
  const { contact, socialLinks } = await getSiteData();

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description} Based in ${locationLabel}, run by ${site.founder}.`,
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): Showreel, about Zack, portfolio, packages and the booking form.`,
    ...SECTIONS.map((s) => `  - [${s.label}](${absoluteUrl("/")}#${s.id}): ${s.description}.`),
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
