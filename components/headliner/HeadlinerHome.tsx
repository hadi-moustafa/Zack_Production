import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { buildGroups, plural } from "@/lib/work";
import Intro from "@/components/headliner/Intro";
import HlHero from "@/components/headliner/HlHero";
import Ticker from "@/components/headliner/Ticker";
import Receipts, { type Stat } from "@/components/headliner/Receipts";
import HlAbout from "@/components/headliner/HlAbout";
import HlClients from "@/components/headliner/HlClients";
import HlWork from "@/components/headliner/HlWork";
import HlPricing from "@/components/headliner/HlPricing";
import HlContact from "@/components/headliner/HlContact";
import type { HomeData } from "@/lib/homeData";

const splitList = (text: string) =>
  text
    .split(/\s*[·•|\n]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Admin's "35+ | Countries" lines, then real counts from the gallery. */
function buildStats(raw: string, films: number, photos: number, categories: number): Stat[] {
  const own = raw
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter(([value, label]) => value && label && /\d/.test(value))
    .map(([value, label]) => ({ value, label }));
  const counted: Stat[] = [
    films ? { value: String(films), label: plural(films, "film").replace(/^\d+ /, "") + " in the reel" } : null,
    photos ? { value: String(photos), label: plural(photos, "photograph").replace(/^\d+ /, "") + " on show" } : null,
    categories > 1 ? { value: String(categories), label: "Categories we own" } : null,
  ].filter((s): s is Stat => s !== null);
  return [...own, ...counted].slice(0, 4);
}

// The Headliner home page: loud, kinetic, and built from the same content as Classic.
export default function HeadlinerHome({ data }: { data: HomeData }) {
  const { photos, categories, pricingPackages, clients, siteData, instagramReel } = data;
  const { content, contact, socialLinks } = siteData;
  const groups = buildGroups(photos, categories);
  const films = groups.reduce((n, g) => n + g.films.length, 0);
  const stills = groups.reduce((n, g) => n + g.photos.length, 0);

  const ticker = content.headliner_ticker
    ? splitList(content.headliner_ticker)
    : [content.about_award, ...splitList(content.about_roles), content.footer_tagline].filter(Boolean);
  const name = (content.photographer_name || "Zack").trim();
  const tagline = content.hero_tagline.trim();

  return (
    <main className="flex-1">
      <Intro name={name.toUpperCase()} />
      <HlHero name={name} headline={content.hero_headline} tagline={tagline} />
      <Ticker items={ticker} />
      <Receipts stats={buildStats(content.headliner_stats, films, stills, groups.length)} />
      <HlAbout
        bio={content.about_bio}
        photoPath={content[SECTION_PHOTO_KEYS.about] || null}
        photoCaption={content.about_photo_caption}
        name={content.about_name || name}
        roles={content.about_roles}
        award={content.about_award}
        tagline={content.about_tagline}
      />
      <HlClients clients={clients} />
      <HlWork photos={photos} categories={categories} />
      <HlPricing packages={pricingPackages} description={content.pricing_description} paymentNote={content.pricing_payment_note} />
      <HlContact description={content.contact_description} contact={contact} socialLinks={socialLinks} instagramReel={instagramReel} />
    </main>
  );
}
