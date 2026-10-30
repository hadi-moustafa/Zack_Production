import Image from "next/image";
import Link from "next/link";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import { CLIENT_LOGOS, FEATURED_CLIENT_LOGOS, logoHeight } from "@/lib/clientLogos";

// A curated dozen, quiet in grey until pointed at; the full list lives on
// /clients. The logos are drawn for dark backgrounds, so this sits on night.
export default function EdClients() {
  if (FEATURED_CLIENT_LOGOS.length === 0) return null;

  return (
    <section id="clients" className="ed-night ed-section scroll-mt-16">
      <InView className="ed-wrap" threshold={0.1}>
        <EdLabel n={3}>Trusted by</EdLabel>
        <h2 className="ed-display ed-h2 ed-reveal mt-6 max-w-[18ch]" style={{ "--d": "100ms" } as React.CSSProperties}>
          They don&apos;t hire just anyone.
        </h2>

        <ul className="mt-14 grid grid-cols-3 border-l border-t border-[var(--ed-night-line)] sm:mt-20 sm:grid-cols-4 lg:grid-cols-6" style={{ "--lh": "clamp(2.25rem, 7vw, 3.5rem)" } as React.CSSProperties}>
          {FEATURED_CLIENT_LOGOS.map((logo, i) => (
            <li
              key={logo.src}
              className="ed-logo-cell ed-reveal flex aspect-[4/3] items-center justify-center border-b border-r border-[var(--ed-night-line)] p-3 sm:p-6"
              style={{ "--d": `${150 + (i % 6) * 60}ms` } as React.CSSProperties}
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                sizes="(min-width: 1024px) 12vw, (min-width: 640px) 18vw, 26vw"
                className="ed-logo"
                style={{ height: logoHeight(logo) }}
              />
            </li>
          ))}
        </ul>

        {CLIENT_LOGOS.length > FEATURED_CLIENT_LOGOS.length ? (
          <p className="ed-reveal mt-10">
            <Link href="/clients" className="ed-link !text-[var(--ed-night-ink)]">
              See all {CLIENT_LOGOS.length} clients →
            </Link>
          </p>
        ) : null}
      </InView>
    </section>
  );
}
