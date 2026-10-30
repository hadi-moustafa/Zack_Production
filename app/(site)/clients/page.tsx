import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import EdLinkList from "@/components/editorial/EdLinkList";
import { getClients } from "@/lib/clients";
import { CLIENT_LOGOS, logoHeight } from "@/lib/clientLogos";
import { site, baseOpenGraph, responsePromise } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Clients",
  description: `The ${CLIENT_LOGOS.length} brands, broadcasters, hotels and venues ${site.name} has filmed and photographed for, from MTV Lebanon and UEFA Euro 2024 to Carrefour and YouTube.`,
  alternates: { canonical: "/clients" },
  openGraph: { ...baseOpenGraph, url: "/clients" },
};

// Every client logo (public/clients, see scripts/logos.mjs), plus anyone
// added in Admin → Clients. The logos are drawn for a dark background, so
// the wall sits on one in every design.
export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="flex-1">
      <PageHeader crumbs={[{ name: "Clients", path: "/clients" }]} eyebrow="Trusted by" title="Our clients">
        <p className="mt-6 max-w-xl text-[1.1rem] leading-relaxed text-[var(--text-secondary)]">
          The {CLIENT_LOGOS.length} brands, broadcasters and venues who trusted {site.name} with their moment, from weddings and grand
          openings to TV programs.
        </p>
      </PageHeader>

      <section aria-label="Client logos" className="ed-night bg-[var(--bg-dark)] py-14 sm:py-20">
        <ul
          className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:grid-cols-3 sm:px-10 lg:grid-cols-5"
          style={{ "--lh": "clamp(2.25rem, 9vw, 3.25rem)" } as React.CSSProperties}
        >
          {CLIENT_LOGOS.map((logo) => (
            <li key={logo.src} className="flex aspect-[3/2] items-center justify-center p-4">
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                sizes="(min-width: 1024px) 14vw, (min-width: 640px) 22vw, 36vw"
                className="w-auto max-w-full object-contain"
                style={{ height: logoHeight(logo) }}
              />
            </li>
          ))}
        </ul>
        {clients.length ? (
          <div className="mx-auto mt-14 max-w-6xl px-5 sm:px-10">
            <h2 className="eyebrow">Also with</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[1.05rem] text-[var(--text-primary)]">
              {clients.map((c) => (
                <li key={c.id}>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                      {c.name}
                    </a>
                  ) : (
                    <span className="inline-flex min-h-11 items-center">{c.name}</span>
                  )}
                  {c.role ? <span className="text-[var(--text-secondary)]"> · {c.role}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <nav aria-label="Next steps" className="ed-wrap py-[var(--ed-section-y)]">
        <h2 className="ed-label">(Your project next?)</h2>
        <EdLinkList
          className="mt-6"
          rows={[
            { href: "/work", title: "See the films and photos we made", meta: "Selected work" },
            { href: "/about", title: `Meet ${site.founder}`, meta: "Behind the lens" },
            { href: "/#contact", title: "Tell us about your date or launch", meta: responsePromise },
          ]}
        />
      </nav>
    </main>
  );
}
