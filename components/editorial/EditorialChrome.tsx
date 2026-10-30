import "@/app/editorial.css";
import BrandLogo from "@/components/BrandLogo";
import StickyCta from "@/components/StickyCta";
import Analytics from "@/components/Analytics";
import EdHeader, { type EdNavLink } from "@/components/editorial/EdHeader";
import EdFooter from "@/components/editorial/EdFooter";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { photoPublicUrl } from "@/lib/media";
import { supabasePublic } from "@/lib/supabasePublic";
import { CLIENT_LOGOS } from "@/lib/clientLogos";
import { telUrl, whatsappUrl } from "@/lib/contact";
import { SECTIONS } from "@/lib/site";
import type { SiteData } from "@/lib/siteData";
import heroPoster from "@/public/videos/hero-poster.webp";

// Header, footer and sticky CTA for the Editorial design. data-design swaps
// the palette (see app/editorial.css); data-no-sound keeps it quiet, with no
// shutter clicks.
export default async function EditorialChrome({
  data,
  structuredData,
  children,
}: {
  data: SiteData;
  structuredData: React.ReactNode;
  children: React.ReactNode;
}) {
  // A few starred stills to preview beside the menu links.
  const { data: starred } = await supabasePublic
    .from("photos")
    .select("storage_path")
    .eq("featured", true)
    .eq("media_type", "photo")
    .not("category_id", "is", null)
    .order("sort_order", { ascending: true })
    .limit(3);
  const stills = (starred ?? []).map((p: { storage_path: string }) => photoPublicUrl(p.storage_path));
  const aboutPhoto = data.content[SECTION_PHOTO_KEYS.about];

  const preview: Record<string, string | null> = {
    about: aboutPhoto ? photoPublicUrl(aboutPhoto) : null,
    gallery: stills[0] ?? null,
    clients: stills[1] ?? null,
    pricing: stills[2] ?? null,
    contact: heroPoster.src,
  };

  // In page order: Clients sits after Work.
  const links: EdNavLink[] = SECTIONS.flatMap((s) => {
    const link = { href: `/#${s.id}`, label: s.label, preview: preview[s.id] ?? null };
    return s.id === "gallery" && CLIENT_LOGOS.length ? [link, { href: "/#clients", label: "Clients", preview: preview.clients }] : [link];
  });

  const { contact } = data;
  const contactLinks = [
    contact.whatsappDigits ? { href: whatsappUrl(contact.whatsappDigits), label: "WhatsApp", external: true } : null,
    contact.phone ? { href: telUrl(contact.phone), label: contact.phone } : null,
    contact.email ? { href: `mailto:${contact.email}`, label: "Email" } : null,
  ].filter((c) => c !== null);

  return (
    <div data-design="editorial" data-no-sound className="flex flex-1 flex-col">
      {structuredData}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:bg-[var(--ed-ink)] focus:px-4 focus:py-3 focus:text-[var(--ed-bg)]"
      >
        Skip to content
      </a>
      <EdHeader logo={<BrandLogo priority className="h-9 sm:h-12" />} links={links} socialLinks={data.socialLinks} contactLinks={contactLinks} />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <EdFooter logo={<BrandLogo className="h-12" />} data={data} links={links} />
      <StickyCta whatsappDigits={data.contact.whatsappDigits} />
      <Analytics />
    </div>
  );
}
