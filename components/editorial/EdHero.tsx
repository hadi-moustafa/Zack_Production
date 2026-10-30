import Image from "next/image";
import EdHeroFilm from "@/components/editorial/EdHeroFilm";
import { publicFileExists } from "@/lib/publicAsset";
import { locationLabel, responsePromise } from "@/lib/site";
import heroPoster from "@/public/videos/hero-poster.webp";

// Full-bleed film, one statement, two label rows and one link.
export default function EdHero({ statement }: { statement: string }) {
  const hasMp4 = publicFileExists("videos/hero.mp4");
  const hasWebm = publicFileExists("videos/hero.webm");

  return (
    <section id="home" aria-label="Introduction" className="ed-night relative isolate flex h-[100svh] min-h-[540px] flex-col overflow-hidden">
      <Image src={heroPoster} alt="" aria-hidden fill priority sizes="100vw" className="-z-20 object-cover" />
      {hasMp4 || hasWebm ? (
        <div className="absolute inset-0 -z-10">
          <EdHeroFilm mp4Src={hasMp4 ? "/videos/hero.mp4" : undefined} webmSrc={hasWebm ? "/videos/hero.webm" : undefined} poster={heroPoster.src} />
        </div>
      ) : null}
      <div aria-hidden className="ed-hero-scrim pointer-events-none absolute inset-0 -z-10" />

      <div className="ed-wrap flex flex-1 flex-col justify-between pb-[calc(var(--ed-gutter)+env(safe-area-inset-bottom))] pt-24 sm:pt-28">
        <p className="ed-label flex justify-between gap-4 !text-[var(--ed-night-ink)]">
          <span>(Photography &amp; Film.)</span>
          <span className="hidden min-[400px]:inline">[{locationLabel}]</span>
        </p>

        <div>
          <h1 className="ed-display ed-h1 max-w-[14ch] text-[var(--ed-night-ink)]">{statement}</h1>
          <div className="mt-8 flex flex-col gap-1 pr-28 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pr-32">
            <a href="#gallery" className="ed-link !text-[var(--ed-night-ink)]">
              View our work <span aria-hidden>↓</span>
            </a>
            <p className="ed-label !text-[var(--ed-night-ink)]">{responsePromise}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
