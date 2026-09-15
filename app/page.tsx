import { supabasePublic } from "@/lib/supabasePublic";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import type { Photo, PricingPackage, PageContent, SocialLink } from "@/lib/types";

export const revalidate = 60;

async function getData() {
  const [photosRes, pricingRes, contentRes, socialRes] = await Promise.all([
    supabasePublic.from("photos").select("*").order("sort_order", { ascending: true }),
    supabasePublic
      .from("pricing_packages")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabasePublic.from("page_content").select("*"),
    supabasePublic.from("social_links").select("*"),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  const pricingPackages = (pricingRes.data ?? []).map((p) => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
  })) as PricingPackage[];
  const content = Object.fromEntries(
    ((contentRes.data ?? []) as PageContent[]).map((c) => [c.key, c.value])
  );
  const socialLinks = (socialRes.data ?? []) as SocialLink[];

  return { photos, pricingPackages, content, socialLinks };
}

export default async function Home() {
  const { photos, pricingPackages, content, socialLinks } = await getData();

  const photographerName = content.photographer_name || "Photographer";
  const heroTagline = content.hero_tagline || "";
  const aboutBio = content.about_bio || "";
  const footerEmail = content.footer_email || "";

  const heroPhoto = photos[0]?.storage_path ?? null;
  const aboutPhoto = photos[1]?.storage_path ?? photos[0]?.storage_path ?? null;

  return (
    <main className="flex-1">
      <Hero
        photographerName={photographerName}
        tagline={heroTagline}
        heroPhotoPath={heroPhoto}
      />
      <About bio={aboutBio} photoPath={aboutPhoto} />
      <Gallery photos={photos} />
      <Pricing packages={pricingPackages} />
      <ContactForm />
      <Footer
        photographerName={photographerName}
        email={footerEmail}
        socialLinks={socialLinks}
      />
    </main>
  );
}
