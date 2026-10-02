import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabasePublic";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { getSiteData } from "@/lib/siteData";
import { getLatestInstagramReel } from "@/lib/instagram";
import { site, baseOpenGraph } from "@/lib/site";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import ContactForm from "@/components/ContactForm";
import { OrnamentDivider } from "@/components/Ornaments";
import type { Photo, PricingPackage } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Photography & Videography in Beirut, Lebanon` },
  description: `Wedding, graduation, food and promo photography & film in ${site.location.city}, ${site.location.country}. Real moments, cinematic edits. We reply ${site.responseTime}.`,
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/" },
};

async function getData() {
  const [photosRes, pricingRes, siteData, instagramReel] = await Promise.all([
    supabasePublic.from("photos").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("pricing_packages").select("*").order("sort_order", { ascending: true }),
    getSiteData(),
    getLatestInstagramReel(),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  const pricingPackages = (pricingRes.data ?? []).map((p) => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
  })) as PricingPackage[];

  return { photos, pricingPackages, siteData, instagramReel };
}

export default async function Home() {
  const { photos, pricingPackages, siteData, instagramReel } = await getData();
  const { content, contact, socialLinks } = siteData;
  // "Featured" holds site imagery rather than portfolio work, so it never
  // backs a section on its own.
  const stillPhotos = photos.filter((p) => p.media_type !== "video" && p.category !== "Featured");

  const aboutPhoto = content[SECTION_PHOTO_KEYS.about] || null;
  const contactPhoto = content[SECTION_PHOTO_KEYS.contact] || stillPhotos[0]?.storage_path || null;

  return (
    <main className="flex-1">
      <Hero headline={content.hero_headline} tagline={content.hero_tagline} />
      <About
        bio={content.about_bio}
        photoPath={aboutPhoto}
        photoCaption={content.about_photo_caption}
        photographerName={content.photographer_name}
      />
      <OrnamentDivider />
      <Gallery photos={photos} />
      <Pricing packages={pricingPackages} description={content.pricing_description} />
      <OrnamentDivider />
      <ContactForm
        description={content.contact_description}
        contact={contact}
        socialLinks={socialLinks}
        instagramReel={instagramReel}
        backgroundPhotoPath={contactPhoto}
      />
    </main>
  );
}
