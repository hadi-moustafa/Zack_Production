import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { buildGroups, pickHighlights } from "@/lib/work";
import EdHero from "@/components/editorial/EdHero";
import EdAbout from "@/components/editorial/EdAbout";
import EdWork from "@/components/editorial/EdWork";
import EdFilms from "@/components/editorial/EdFilms";
import EdStills from "@/components/editorial/EdStills";
import EdClients from "@/components/editorial/EdClients";
import EdCapabilities from "@/components/editorial/EdCapabilities";
import EdPricing from "@/components/editorial/EdPricing";
import EdInquiry from "@/components/editorial/EdInquiry";
import type { HomeData } from "@/lib/homeData";

// The Editorial home page, built from the same content as the other designs:
// hero → award → about → work index → films → stills → clients →
// capabilities → rate card → inquiry (the footer lives in EditorialChrome).
export default function EditorialHome({ data }: { data: HomeData }) {
  const { photos, categories, pricingPackages, siteData, instagramReel } = data;
  const { content, contact } = siteData;

  const groups = buildGroups(photos, categories);
  const films = pickHighlights(groups, "films", 10, 2);
  const stills = pickHighlights(groups, "photos", 40, 8);

  return (
    <main className="flex-1">
      <EdHero statement={content.editorial_statement} />
      <EdAbout
        bio={content.about_bio}
        photoPath={content[SECTION_PHOTO_KEYS.about] || null}
        name={content.about_name || content.photographer_name}
        roles={content.about_roles}
        award={content.about_award}
        tagline={content.about_tagline}
      />
      <EdWork groups={groups} />
      <EdFilms films={films} />
      <EdStills stills={stills} />
      <EdClients />
      <EdCapabilities groups={groups} />
      <EdPricing packages={pricingPackages} description={content.pricing_description} paymentNote={content.pricing_payment_note} />
      <EdInquiry headline={content.editorial_inquiry} description={content.contact_description} contact={contact} instagramReel={instagramReel} />
    </main>
  );
}
