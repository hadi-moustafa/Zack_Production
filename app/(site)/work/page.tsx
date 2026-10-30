import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EdWork from "@/components/editorial/EdWork";
import EdFilms from "@/components/editorial/EdFilms";
import EdStills from "@/components/editorial/EdStills";
import EdLinkList from "@/components/editorial/EdLinkList";
import { getWorkGroups } from "@/lib/workData";
import { pickHighlights, plural } from "@/lib/work";
import { site, baseOpenGraph, responsePromise } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Selected Work",
  description: `Wedding, engagement, food, beauty and brand films and photography by ${site.name} in ${site.location.city}, ${site.location.country}, by category.`,
  alternates: { canonical: "/work" },
  openGraph: { ...baseOpenGraph, url: "/work" },
};

// The whole portfolio: the category index (each to its own page), then the
// highlight films and stills.
export default async function WorkPage() {
  const groups = await getWorkGroups();
  const films = groups.reduce((n, g) => n + g.films.length, 0);
  const photos = groups.reduce((n, g) => n + g.photos.length, 0);

  return (
    <main className="flex-1">
      <PageHeader crumbs={[{ name: "Work", path: "/work" }]} eyebrow="Selected work" title="The work, by category">
        <p className="ed-lead mt-6">
          {plural(films, "film")} and {plural(photos, "photo")} across {plural(groups.length, "category", "categories")}: weddings and
          engagements, food, beauty and brand promotions, filmed and photographed by {site.founder}.
        </p>
      </PageHeader>

      <EdWork groups={groups} label={false} />
      <EdFilms films={pickHighlights(groups, "films", 10, 2)} />
      <EdStills stills={pickHighlights(groups, "photos", 40, 8)} />

      <nav aria-label="Next steps" className="ed-wrap py-[var(--ed-section-y)]">
        <p className="ed-label">(Next.)</p>
        <EdLinkList
          className="mt-6"
          rows={[
            { href: "/about", title: `About ${site.founder}`, meta: "The person behind the lens" },
            { href: "/clients", title: "Our clients", meta: "Who trusted us" },
            { href: "/#pricing", title: "Packages & pricing", meta: "The rate card" },
            { href: "/#contact", title: "Book a shoot", meta: responsePromise },
          ]}
        />
      </nav>
    </main>
  );
}
