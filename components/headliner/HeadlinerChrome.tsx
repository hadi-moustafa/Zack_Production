import "@/app/headliner.css";
import BrandLogo from "@/components/BrandLogo";
import StickyCta from "@/components/StickyCta";
import Analytics from "@/components/Analytics";
import HlNav, { type NavLink } from "@/components/headliner/HlNav";
import HlFooter from "@/components/headliner/HlFooter";
import HlFx from "@/components/headliner/HlFx";
import { getClients } from "@/lib/clients";
import { SECTIONS } from "@/lib/site";
import type { SiteData } from "@/lib/siteData";

// Header, footer, sticky CTA and effects for the Headliner design. The
// data-design attribute switches the palette (see app/headliner.css), and
// data-no-sound hands click sounds over from the classic shutter to HlFx.
export default async function HeadlinerChrome({
  data,
  structuredData,
  children,
}: {
  data: SiteData;
  structuredData: React.ReactNode;
  children: React.ReactNode;
}) {
  const clients = await getClients();
  const links: NavLink[] = SECTIONS.flatMap((s) => {
    const link = { href: `/#${s.id}`, label: s.label };
    return s.id === "about" && clients.length ? [link, { href: "/#clients", label: "Clients" }] : [link];
  });

  return (
    <div data-design="headliner" data-no-sound className="flex flex-1 flex-col">
      {structuredData}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[95] focus:bg-[var(--hl-volt)] focus:px-4 focus:py-3 focus:text-[var(--hl-ink)]"
      >
        Skip to content
      </a>
      <HlNav logo={<BrandLogo priority className="h-11 sm:h-14" />} links={links} socialLinks={data.socialLinks} />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <HlFooter logo={<BrandLogo className="h-14" />} data={data} links={links} />
      <StickyCta whatsappDigits={data.contact.whatsappDigits} />
      <HlFx />
      <Analytics />
    </div>
  );
}
