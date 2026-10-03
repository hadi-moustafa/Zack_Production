import type { Metadata } from "next";
import { supabasePublic } from "@/lib/supabasePublic";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { getSiteData } from "@/lib/siteData";
import { getLatestInstagramReel } from "@/lib/instagram";
import { site, baseOpenGraph } from "@/lib/site";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Work from "@/components/Work";
import Pricing from "@/components/Pricing";
import ContactForm from "@/components/ContactForm";
import { OrnamentDivider } from "@/components/Ornaments";
import type { Category, Photo, PricingPackage } from "@/lib/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: `${site.name} | Photography & Videography in Beirut, Lebanon` },
  description: `Wedding, graduation, food and promo photography & film in ${site.location.city}, ${site.location.country}. Real moments, cinematic edits. We reply ${site.responseTime}.`,
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/" },
};

async function getData() {
  const [photosRes, categoriesRes, pricingRes, siteData, instagramReel] = await Promise.all([
    supabasePublic.from("photos").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("categories").select("*").order("sort_order", { ascending: true }),
    supabasePublic.from("pricing_packages").select("*").order("sort_order", { ascending: true }),
    getSiteData(),
    getLatestInstagramReel(),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  const categories = (categoriesRes.data ?? []) as Category[];
  const pricingPackages = (pricingRes.data ?? []).map((p) => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
  })) as PricingPackage[];

  return { photos, categories, pricingPackages, siteData, instagramReel };
}

export default async function Home() {
  const { photos, categories, pricingPackages, siteData, instagramReel } = await getData();
  const { content, contact, socialLinks } = siteData;
  // Gallery photos only: site images (no category) never back a section on their own.
  const stillPhotos = photos.filter((p) => p.media_type !== "video" && p.category_id);

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
        fullName={content.about_name}
        roles={content.about_roles}
        award={content.about_award}
        tagline={content.about_tagline}
      />
      <OrnamentDivider />
      <Work photos={photos} categories={categories} />
      <Pricing
        packages={pricingPackages}
        description={content.pricing_description}
        paymentNote={content.pricing_payment_note}
      />
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
