import "@/app/social.css";
import Image from "next/image";
import Link from "next/link";
import SocialPlans from "@/components/social/SocialPlans";
import { IconArrowRight } from "@/components/icons";
import { photoPublicUrl } from "@/lib/media";
import { site, responsePromise } from "@/lib/site";
import { groupPricing, type PricingGroup } from "@/lib/pricing";
import type { Photo, PricingPackage } from "@/lib/types";

// The social media design (see app/social.css), shared by the /social-media
// page and the Social Media section of every home design: a dark "feed" stage
// with the real work on a phone, the plans as posts, and how a month runs.

export type FeedStill = Pick<Photo, "id" | "storage_path" | "blur_data">;

/** The first nine starred gallery photos, for the phone. */
export function feedStills(photos: Photo[]): FeedStill[] {
  return photos.filter((p) => p.featured && p.media_type === "photo" && p.category_id).slice(0, 9);
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

/** What every plan handles, beside a phone of real stills. */
export function SocialHandled({
  feed,
  id,
  headingId,
  label,
  title,
  lead,
}: {
  feed: FeedStill[];
  id?: string;
  headingId: string;
  label: string;
  title: string;
  lead?: string;
}) {
  const showPhone = feed.length >= 6;
  return (
    <section id={id} aria-labelledby={headingId} className="sm-stage ed-night scroll-mt-20 py-16 sm:py-24">
      <div className={`sm-wrap grid grid-cols-[minmax(0,1fr)] items-center gap-14 ${showPhone ? "lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20" : ""}`}>
        <div>
          <p className="sm-label">{label}</p>
          <h2 id={headingId} className="sm-title mt-4 max-w-[18ch]">
            {title}
          </h2>
          {lead ? <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-[var(--text-secondary)]">{lead}</p> : null}
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
  );
}

/** The plans, as posts. */
export function SocialPlansSection({
  groups,
  id,
  headingId,
  children,
}: {
  groups: PricingGroup[];
  id: string;
  headingId: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={headingId} className="sm-stage ed-night scroll-mt-20 border-t border-[var(--border-subtle)] py-16 sm:py-24">
      <div className="sm-wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="sm-label">Pricing, in USD</p>
          <h2 id={headingId} className="sm-title mt-4">
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
        {children}
      </div>
    </section>
  );
}

/** How a month runs, in three steps. */
export function SocialSteps({ headingId, children }: { headingId: string; children?: React.ReactNode }) {
  return (
    <section aria-labelledby={headingId} className="sm-wrap py-16 sm:py-24">
      <p className="sm-label">How it works</p>
      <h2 id={headingId} className="sm-title mt-4 text-[var(--text-primary)]">
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
      {children}
    </section>
  );
}

export const SOCIAL_LEAD = "Monthly management of your social media: content, design, security and growth, done for you.";

/** The Social Media section of the home page, in every design. */
export function SocialHome({ packages, photos }: { packages: PricingPackage[]; photos: Photo[] }) {
  const groups = groupPricing(packages).social;
  return (
    <>
      <SocialHandled
        feed={feedStills(photos)}
        id="social-media"
        headingId="social-media-title"
        label="Social media management"
        title="Your page, handled"
        lead={SOCIAL_LEAD}
      />
      <SocialPlansSection groups={groups} id="social-plans" headingId="social-plans-title" />
      <SocialSteps headingId="social-steps-title">
        <Link href="/social-media" className="btn-ghost mt-10 !rounded-full !px-6">
          More about social media management <IconArrowRight className="h-4 w-4" />
        </Link>
      </SocialSteps>
    </>
  );
}
