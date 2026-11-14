import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EdLinkList from "@/components/editorial/EdLinkList";
import { SocialHandled, SocialPlansSection, SocialSteps, type FeedStill, SOCIAL_LEAD } from "@/components/social/SocialFeed";
import { IconArrowRight } from "@/components/icons";
import { getPricingPackages } from "@/lib/pricingData";
import { groupPricing } from "@/lib/pricing";
import { supabasePublic } from "@/lib/supabasePublic";
import { jsonLd, socialMediaService } from "@/lib/structuredData";
import { site, baseOpenGraph, locationLabel, responsePromise } from "@/lib/site";

export const revalidate = 3600;

const PATH = "/social-media";

/** The lowest plan price, e.g. "$600", for the description. */
function fromPrice(prices: string[]) {
  const amounts = prices.map((p) => Number(p.replace(/[^0-9.]/g, ""))).filter((n) => n > 0);
  return amounts.length ? `$${Math.min(...amounts).toLocaleString("en-US")}` : null;
}

async function getPlans() {
  const groups = groupPricing(await getPricingPackages()).social;
  const plans = groups.flatMap((g) => g.items);
  return { groups, plans, from: fromPrice(plans.map((p) => p.price)) };
}

export async function generateMetadata(): Promise<Metadata> {
  const { from } = await getPlans();
  return {
    title: "Social Media Management",
    description: `Monthly social media management by ${site.name} in ${locationLabel}: reels filmed and edited, posts designed, account security and boosting, all handled for you.${
      from ? ` Plans from ${from} a month.` : ""
    }`,
    alternates: { canonical: PATH },
    openGraph: { ...baseOpenGraph, url: PATH },
  };
}

// Social media management, on a page of its own: a dark "feed" stage with the
// real work on a phone, the plans as posts, and how a month runs.
export default async function SocialMediaPage() {
  const [{ groups, plans }, { data: stills }] = await Promise.all([
    getPlans(),
    supabasePublic
      .from("photos")
      .select("id, storage_path, blur_data")
      .eq("featured", true)
      .eq("media_type", "photo")
      .not("category_id", "is", null)
      .order("sort_order", { ascending: true })
      .limit(9),
  ]);
  const feed = (stills ?? []) as FeedStill[];
  const lead = SOCIAL_LEAD;

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(socialMediaService(plans, lead))} />
      <PageHeader crumbs={[{ name: "Social Media", path: PATH }]} eyebrow="Social media management" title="Your page, handled">
        <p className="mt-6 max-w-xl text-[1.1rem] leading-relaxed text-[var(--text-secondary)]">{lead}</p>
        {groups.length ? (
          <a href="#plans" className="btn-ghost mt-8 !rounded-full !px-6">
            See the plans <IconArrowRight className="h-4 w-4" />
          </a>
        ) : null}
      </PageHeader>

      <SocialHandled feed={feed} headingId="sm-handled" label="What we handle" title="Everything your page needs, from one team" />
      <SocialPlansSection groups={groups} id="plans" headingId="sm-plans" />
      <SocialSteps headingId="sm-steps" />

      <nav aria-label="Next steps" className="sm-wrap pb-16 sm:pb-24">
        <p className="sm-label">Next</p>
        <EdLinkList
          className="mt-6"
          rows={[
            { href: "/work", title: "See the reels and photos we make", meta: "Selected work" },
            { href: "/#pricing", title: "Photo & film packages", meta: "Weddings, events, shoots" },
            { href: "/#contact", title: "Tell us about your page", meta: responsePromise },
          ]}
        />
      </nav>
    </main>
  );
}
