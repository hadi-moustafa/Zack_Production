import { supabasePublic } from "@/lib/supabasePublic";
import { withDefaults, SECTION_PHOTO_KEYS } from "@/lib/content";
import Nav from "@/components/Nav";
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
  const content = withDefaults(
    Object.fromEntries(((contentRes.data ?? []) as PageContent[]).map((c) => [c.key, c.value]))
  );
  const socialLinks = (socialRes.data ?? []) as SocialLink[];

  return { photos, pricingPackages, content, socialLinks };
}

export default async function Home() {
  const { photos, pricingPackages, content, socialLinks } = await getData();
  const stillPhotos = photos.filter((p) => p.media_type !== "video");

  const heroPhoto =
    content[SECTION_PHOTO_KEYS.hero] || stillPhotos[0]?.storage_path || null;
  const aboutPhoto =
    content[SECTION_PHOTO_KEYS.about] || stillPhotos[1]?.storage_path || stillPhotos[0]?.storage_path || null;
  const contactPhoto =
    content[SECTION_PHOTO_KEYS.contact] || stillPhotos[2]?.storage_path || stillPhotos[0]?.storage_path || null;

  return (
    <>
      <Nav
        name={content.photographer_name}
        subtitle={content.brand_subtitle}
        socialLinks={socialLinks}
      />
      <main className="flex-1">
        <Hero
          headline={content.hero_headline}
          tagline={content.hero_tagline}
          heroPhotoPath={heroPhoto}
        />
        <About
          bio={content.about_bio}
          photoPath={aboutPhoto}
          photoCaption={content.about_photo_caption}
          photographerName={content.photographer_name}
          locationText={content.location_text}
        />
        <Gallery photos={photos} includeStaticWork={content.static_media_imported !== "1"} />
        <Pricing packages={pricingPackages} description={content.pricing_description} />
        <ContactForm
          description={content.contact_description}
          phone={content.contact_phone}
          email={content.footer_email}
          whatsappNumber={content.whatsapp_number}
          locationText={content.location_text}
          socialLinks={socialLinks}
          backgroundPhotoPath={contactPhoto}
        />
        <Footer photographerName={content.photographer_name} tagline={content.footer_tagline} />
      </main>
    </>
  );
}
