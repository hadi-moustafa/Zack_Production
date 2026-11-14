import "@/app/social.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import EdLinkList from "@/components/editorial/EdLinkList";
import SocialPlans from "@/components/social/SocialPlans";
import { IconArrowRight } from "@/components/icons";
import { getPricingPackages } from "@/lib/pricingData";
import { groupPricing } from "@/lib/pricing";
import { photoPublicUrl } from "@/lib/media";
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

// What every plan covers, in the words of the plans themselves.
const PILLARS = [
  { title: "Content", text: "Reels filmed and edited by us, the same team behind our weddings, launches and TV work." },
  { title: "Design", text: "Posts designed to a colour palette and style made for your page, so the grid looks like you." },
  { title: "Security", text: "Your account protected and looked after, so you never lose the page you've built." },
  { title: "Growth", text: "Boosting that puts your best posts in front of the right people." },
];

const STEPS = [
  { title: "Plan", text: "We get to know your brand and set the look of your page and the month ahead." },
  { title: "Create", text: "We film and edit the reels and design the posts in your plan." },
  { title: "Post & grow", text: "We publish, boost and keep the account safe, and you get on with your business." },
];

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
  const feed = (stills ?? []) as { id: string; storage_path: string; blur_data: string | null }[];
  const showPhone = feed.length >= 6;
  const lead = "Monthly management of your social media: content, design, security and growth, done for you.";

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

      <section aria-labelledby="sm-handled" className="sm-stage ed-night py-16 sm:py-24">
        <div className={`sm-wrap grid grid-cols-[minmax(0,1fr)] items-center gap-14 ${showPhone ? "lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20" : ""}`}>
          <div>
            <p className="sm-label">What we handle</p>
            <h2 id="sm-handled" className="sm-title mt-4 max-w-[18ch]">
              Everything your page needs, from one team
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <li key={p.title} className="border-t border-[var(--border-subtle)] pt-5">
                  <p className="sm-label">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-serif-display mt-2 text-[1.75rem] leading-none text-[var(--text-primary)]">{p.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>

          {showPhone ? (
            // A phone showing a page of our real stills: decoration, the
            // same photos are on /work with their captions.
            <div aria-hidden className="flex justify-center">
              <div className="sm-phone">
                <div className="sm-screen">
                  <div className="sm-notch" />
                  <div className="flex items-center gap-3 px-4 pb-3 pt-4">
                    <span className="sm-ring rounded-full p-[2px]">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--bg-dark-alt)] bg-[var(--bg-dark)] font-serif-display text-xl leading-none text-[var(--text-primary)]">
                        {site.name.charAt(0)}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.95rem] font-semibold text-[var(--text-primary)]">Your page</span>
                      <span className="block truncate font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                        Managed by {site.name}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-[2px]">
                    {feed.slice(0, 9).map((p) => (
                      <div key={p.id} className="relative aspect-square bg-[var(--bg-dark)]">
                        <Image
                          src={photoPublicUrl(p.storage_path)}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                          {...(p.blur_data ? { placeholder: "blur" as const, blurDataURL: p.blur_data } : {})}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section id="plans" aria-labelledby="sm-plans" className="sm-stage ed-night scroll-mt-20 border-t border-[var(--border-subtle)] py-16 sm:py-24">
        <div className="sm-wrap">
          <div className="mx-auto max-w-2xl text-center">
            <p className="sm-label">Pricing, in USD</p>
            <h2 id="sm-plans" className="sm-title mt-4">
              Pick your plan
            </h2>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-[var(--text-secondary)]">
              Choose a plan and book it. {responsePromise}
            </p>
          </div>
          <div className="mt-12 sm:mt-16">
            {groups.length ? (
              <SocialPlans groups={groups} />
            ) : (
              <p className="text-center">
                <Link href="/#contact" className="btn-gold">
                  Ask us about a plan for your page <IconArrowRight className="h-4 w-4" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="sm-steps" className="sm-wrap py-16 sm:py-24">
        <p className="sm-label">How it works</p>
        <h2 id="sm-steps" className="sm-title mt-4 text-[var(--text-primary)]">
          A month with us
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 md:flex-col">
              <span aria-hidden className="sm-step-n">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-serif-display text-[1.75rem] leading-none text-[var(--text-primary)]">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-secondary)]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

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
