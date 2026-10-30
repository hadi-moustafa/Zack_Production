import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import EdLinkList from "@/components/editorial/EdLinkList";
import { getSiteData } from "@/lib/siteData";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { photoPublicUrl } from "@/lib/media";
import { aboutPage, jsonLd } from "@/lib/structuredData";
import { CLIENT_LOGOS } from "@/lib/clientLogos";
import { site, baseOpenGraph, locationLabel, responsePromise } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSiteData();
  const name = content.about_name || site.founder;
  const roles = content.about_roles.split(/[·•|]/).map((r) => r.trim()).filter(Boolean);
  return {
    title: `About ${name}`,
    description: `${name}${roles.length ? `, ${roles.join(", ").toLowerCase()}` : ""}: the founder of ${site.name} in ${locationLabel}.${
      content.about_award ? ` ${content.about_award}.` : ""
    }`,
    alternates: { canonical: "/about" },
    openGraph: { ...baseOpenGraph, url: "/about" },
  };
}

// The whole story behind the home page's short "Who we are": portrait, roles,
// the full bio, the award and the signature line.
export default async function AboutPage() {
  const data = await getSiteData();
  const { content } = data;
  const name = content.about_name || site.founder;
  const roles = content.about_roles.split(/[·•|]/).map((r) => r.trim()).filter(Boolean);
  const paragraphs = content.about_bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const photo = content[SECTION_PHOTO_KEYS.about];
  const [awardTitle, awardDetail] = content.about_award.split(/\s+[—–-]\s+/, 2);

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(aboutPage(data))} />
      <PageHeader crumbs={[{ name: "About", path: "/about" }]} eyebrow="Who we are" title={name}>
        {roles.length ? <p className="ed-label ed-label-ink mt-6">{roles.join(" · ")}</p> : null}
      </PageHeader>

      <section aria-label="Biography" className="ed-wrap grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-8">
        {photo ? (
          <div className="ed-media relative aspect-[4/5] w-full max-w-md bg-[var(--ed-bg-alt)] lg:col-span-5 lg:max-w-none">
            <Image
              src={photoPublicUrl(photo)}
              alt={`${name}, photographer and filmmaker at ${site.name}`}
              fill
              priority
              sizes="(min-width: 1024px) 38vw, (min-width: 448px) 448px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className={photo ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-8"}>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "ed-lead !text-[var(--ed-ink)]" : "ed-body mt-6"}>
              {p}
            </p>
          ))}
          {content.about_award ? (
            <div className="mt-12 border-y border-[var(--ed-line)] py-6">
              <p className="ed-label">
                <span aria-hidden className="mr-2 text-[var(--ed-accent)]">
                  ★
                </span>
                Award
              </p>
              <p className="ed-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] text-[var(--ed-ink)]">{awardTitle}</p>
              {awardDetail ? <p className="ed-label ed-label-ink mt-2">{awardDetail}</p> : null}
            </div>
          ) : null}
          <p className="ed-label mt-8">Based in {locationLabel}.</p>
        </div>
      </section>

      {content.about_tagline ? (
        <section aria-label="Signature" className="ed-wrap border-t border-[var(--ed-line)] py-[var(--ed-section-y)]">
          <p className="ed-display ed-h2 max-w-[22ch] italic text-[var(--ed-ink)]">{content.about_tagline}</p>
        </section>
      ) : null}

      <nav aria-label="Next steps" className="ed-wrap pb-[var(--ed-section-y)]">
        <p className="ed-label">Next</p>
        <EdLinkList
          className="mt-6"
          rows={[
            { href: "/work", title: "See the work", meta: "Films & photos by category" },
            { href: "/clients", title: "Our clients", meta: `${CLIENT_LOGOS.length} names` },
            { href: "/#contact", title: "Work with us", meta: responsePromise },
          ]}
        />
      </nav>
    </main>
  );
}
