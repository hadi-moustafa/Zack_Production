import { SECTION_PHOTO_KEYS } from "@/lib/content";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Work from "@/components/Work";
import Pricing from "@/components/Pricing";
import ContactForm from "@/components/ContactForm";
import { OrnamentDivider } from "@/components/Ornaments";
import type { HomeData } from "@/lib/homeData";

// The original gold-and-ink home page.
export default function ClassicHome({ data }: { data: HomeData }) {
  const { photos, categories, pricingPackages, siteData, instagramReel } = data;
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
