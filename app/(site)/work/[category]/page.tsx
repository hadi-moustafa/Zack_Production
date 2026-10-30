import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EdCategoryGallery from "@/components/editorial/EdCategoryGallery";
import EdLinkList from "@/components/editorial/EdLinkList";
import { getWorkGroups } from "@/lib/workData";
import { countLabel, type Group } from "@/lib/work";
import { categoryPage, jsonLd } from "@/lib/structuredData";
import { site, baseOpenGraph, responsePromise } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getWorkGroups()).map((g) => ({ category: g.category.slug }));
}

async function find(slug: string) {
  const groups = await getWorkGroups();
  const i = groups.findIndex((g) => g.category.slug === slug);
  return i === -1 ? null : { group: groups[i], next: groups[(i + 1) % groups.length], groups };
}

/** "Birthdays and more" → "Birthdays and more." (left alone if it already ends a sentence). */
const sentence = (text: string) => (/[.!?…]$/.test(text) ? text : `${text}.`);

/** The admin's own line when there is one, otherwise a plain account of what's here. */
function describe(group: Group) {
  const own = group.category.description.trim();
  const counts = countLabel(group);
  return own
    ? `${sentence(own)} ${counts} by ${site.name}, ${site.location.city}.`
    : `${group.category.name} films and photography by ${site.name} in ${site.location.city}, ${site.location.country}: ${counts}, shot and edited by ${site.founder}.`;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const found = await find(category);
  if (!found) return {};
  const path = `/work/${found.group.category.slug}`;
  return {
    title: `${found.group.category.name} — Films & Photography`,
    description: describe(found.group),
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, url: path },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const found = await find(category);
  if (!found) notFound();
  const { group, next, groups } = found;

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(categoryPage(group, describe(group)))} />
      <PageHeader
        crumbs={[
          { name: "Work", path: "/work" },
          { name: group.category.name, path: `/work/${group.category.slug}` },
        ]}
        eyebrow={countLabel(group)}
        title={group.category.name}
      >
        {group.category.description ? <p className="ed-lead mt-6">{sentence(group.category.description.trim())}</p> : null}
      </PageHeader>

      <section aria-label={`${group.category.name} films and photos`} className="ed-wrap pt-10 sm:pt-14">
        <EdCategoryGallery group={group} />
      </section>

      <nav aria-label="More work" className="ed-wrap py-[var(--ed-section-y)]">
        {groups.length > 1 ? (
          <>
            <p className="ed-label">(Next category.)</p>
            <EdLinkList className="mt-6" rows={[{ href: `/work/${next.category.slug}`, title: next.category.name, meta: countLabel(next) }]} />
          </>
        ) : null}
        <p className="ed-label mt-16">(Elsewhere.)</p>
        <EdLinkList
          className="mt-6"
          rows={[
            { href: "/work", title: "All work", meta: "Every category" },
            { href: "/#pricing", title: `${group.category.name} packages & pricing`, meta: "The rate card" },
            { href: "/#contact", title: "Book a shoot", meta: responsePromise },
          ]}
        />
      </nav>
    </main>
  );
}
