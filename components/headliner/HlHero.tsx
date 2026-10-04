import Image from "next/image";
import HeroVideo from "@/components/HeroVideo";
import { IconArrowRight } from "@/components/icons";
import { HeroScroll, BeirutClock } from "@/components/headliner/HeroStage";
import { splitHalves } from "@/components/headliner/Kinetic";
import { publicFileExists } from "@/lib/publicAsset";
import { site, responsePromise } from "@/lib/site";
import heroPoster from "@/public/videos/hero-poster.webp";

// The showreel plays inside the name. Scrolling flies through the letters
// until the film fills the screen, then the tagline lands.
export default function HlHero({ name, headline, tagline }: { name: string; headline: string; tagline: string }) {
  const hasMp4 = publicFileExists("videos/hero.mp4");
  const hasWebm = publicFileExists("videos/hero.webm");
  const word = name.toUpperCase();
  const [top, bottom] = splitHalves(word);
  const words = headline.trim().split(/\s+/);
  const last = words.pop();

  return (
    <HeroScroll>
      <div className="hl-hero-stage isolate">
        <Image src={heroPoster} alt="" aria-hidden fill priority sizes="100vw" className="object-cover" />
        {hasMp4 || hasWebm ? (
          <HeroVideo
            mp4Src={hasMp4 ? "/videos/hero.mp4" : undefined}
            webmSrc={hasWebm ? "/videos/hero.webm" : undefined}
            poster={heroPoster.src}
          />
        ) : null}

        <div aria-hidden className="hl-knockout">
          <svg className="tall" viewBox="0 0 100 166" preserveAspectRatio="xMidYMid meet">
            <text x="50" y="76" textAnchor="middle" textLength="98" lengthAdjust="spacingAndGlyphs" fontSize="100">
              {top}
            </text>
            <text x="50" y="160" textAnchor="middle" textLength="98" lengthAdjust="spacingAndGlyphs" fontSize="100">
              {bottom}
            </text>
          </svg>
          <svg className="wide" viewBox="0 0 300 104" preserveAspectRatio="xMidYMid meet">
            <text x="150" y="96" textAnchor="middle" textLength="298" lengthAdjust="spacingAndGlyphs" fontSize="134">
              {word}
            </text>
          </svg>
        </div>

        {/* Bottom-left, clear of the sticky phone CTA; one line on a phone. */}
        <p
          aria-hidden
          className="hl-hero-after pointer-events-none absolute inset-0 flex items-end"
        >
          <span className="hl-cinematic mx-auto block w-full max-w-7xl px-5 pb-28 text-left text-[length:calc((100vw_-_2.5rem)/8.6)] sm:px-8 sm:text-[clamp(3.5rem,17vw,10rem)] lg:pb-14">
            {tagline}
          </span>
        </p>

        <div className="hl-hero-copy absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 sm:pb-10">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.78rem] uppercase tracking-[0.18em] text-[var(--text-primary)]">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="hl-live-dot" /> Live from {site.location.city}
            </span>
            <span aria-hidden className="text-[var(--text-secondary)]">
              <BeirutClock />
            </span>
          </p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="hl-display text-[clamp(2.6rem,12vw,6rem)]">
                {words.join(" ")} {last ? <span className="hl-em">{last}</span> : null}
              </h1>
              {tagline ? <p className="mt-2 text-[1.05rem] text-[var(--text-secondary)]">{tagline}</p> : null}
            </div>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <a href="#gallery" className="hl-btn" data-cursor="Watch">
                View our work <IconArrowRight aria-hidden className="h-4 w-4" />
              </a>
              <p className="text-base text-[var(--text-secondary)]">{responsePromise}</p>
            </div>
          </div>
        </div>
      </div>
    </HeroScroll>
  );
}
