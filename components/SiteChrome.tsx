import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import Analytics from "@/components/Analytics";
import BrandLogo from "@/components/BrandLogo";
import { getSiteData } from "@/lib/siteData";
import { organizationGraph, jsonLd } from "@/lib/structuredData";

// Header, footer, sticky CTA, analytics and organization structured data,
// shared by every public page (including the 404).
export default async function SiteChrome({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationGraph(data))} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-[var(--accent-gold)] focus:px-4 focus:py-3 focus:text-[#0a0a0a]"
      >
        Skip to content
      </a>
      <Nav logo={<BrandLogo priority className="h-12 sm:h-16" />} socialLinks={data.socialLinks} />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <Footer logo={<BrandLogo className="h-14" />} data={data} />
      <StickyCta whatsappDigits={data.contact.whatsappDigits} />
      <Analytics />
    </>
  );
}
