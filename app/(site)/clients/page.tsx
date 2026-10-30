import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { IconArrowRight } from "@/components/icons";
import { getClients } from "@/lib/clients";
import { CLIENT_LOGOS, logoHeight } from "@/lib/clientLogos";
import { site, baseOpenGraph } from "@/lib/site";

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

      <nav aria-label="Next steps" className="mx-auto max-w-3xl px-5 py-14 sm:px-10 sm:py-20">
        <h2 className="font-serif-display text-3xl font-semibold text-[var(--text-primary)]">Your project next?</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/#gallery"
              className="group flex h-full min-h-28 flex-col justify-between border border-[var(--border-subtle)] p-6 transition hover:border-[var(--accent-gold)]"
            >
              <span className="text-lg font-semibold text-[var(--text-primary)]">See the films and photos we made</span>
              <span className="mt-3 inline-flex items-center gap-2 text-[var(--accent-gold-bright)]">
                Browse the work <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/#contact"
              className="group flex h-full min-h-28 flex-col justify-between border border-[var(--border-subtle)] p-6 transition hover:border-[var(--accent-gold)]"
            >
              <span className="text-lg font-semibold text-[var(--text-primary)]">Tell us about your date or launch</span>
              <span className="mt-3 inline-flex items-center gap-2 text-[var(--accent-gold-bright)]">
                Get in touch <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
