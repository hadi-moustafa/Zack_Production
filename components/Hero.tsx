import Image from "next/image";
import { publicFileExists } from "@/lib/publicAsset";
import { IconArrowRight } from "@/components/icons";
import HeroVideo from "@/components/HeroVideo";
import { ScribbleArrow } from "@/components/Ornaments";
import { site, responsePromise } from "@/lib/site";
import heroPoster from "@/public/videos/hero-poster.webp";

const HERO_VIDEO_MP4 = "/videos/hero.mp4";
const HERO_VIDEO_WEBM = "/videos/hero.webm";

export default function Hero({ headline, tagline }: { headline: string; tagline: string }) {
  const hasMp4 = publicFileExists("videos/hero.mp4");
  const hasWebm = publicFileExists("videos/hero.webm");

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex h-[100svh] min-h-[600px] w-full items-end overflow-hidden bg-[var(--bg-dark)]"
    >
      <div aria-hidden className="letterbox-bar letterbox-top" />
      <div aria-hidden className="letterbox-bar letterbox-bottom" />

      {/* The poster is the video's own first frame, so the swap is seamless. */}
      <Image
        src={heroPoster}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {hasMp4 || hasWebm ? (
        <HeroVideo
          mp4Src={hasMp4 ? HERO_VIDEO_MP4 : undefined}
          webmSrc={hasWebm ? HERO_VIDEO_WEBM : undefined}
          poster={heroPoster.src}
        />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/25" />

      <div aria-hidden className="hero-frame" />
      <span aria-hidden className="vf-corner vf-tl" />
      <span aria-hidden className="vf-corner vf-tr" />
      <span aria-hidden className="vf-corner vf-bl" />
      <span aria-hidden className="vf-corner vf-br" />
      <p
        aria-hidden
        className="eyebrow absolute right-[56px] top-[124px] z-20 hidden items-center gap-2 !text-[var(--text-primary)]/80 sm:flex"
      >
        <span className="rec-dot inline-block h-2 w-2 rounded-full bg-red-600" /> REC · ISO 400 · f/1.8
      </p>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 sm:px-16 sm:pb-24">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Photography & Film · {site.location.city}
          </p>
          <h1
            className="font-serif-display animate-fade-up mt-4 text-[clamp(3rem,14vw,7.5rem)] font-medium italic leading-[0.94] text-[var(--text-primary)]"
            style={{ animationDelay: "0.25s" }}
          >
            {headline}
          </h1>
          {tagline ? (
            <p
              className="animate-fade-up mt-5 max-w-md text-[clamp(1.05rem,2.6vw,1.2rem)] leading-relaxed text-[var(--text-primary)]/85"
              style={{ animationDelay: "0.4s" }}
            >
              {tagline}
            </p>
          ) : null}
          <div
            className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:w-max xl:flex-nowrap"
            style={{ animationDelay: "0.55s" }}
          >
            <a href="#contact" className="btn-gold justify-center">
              Book a shoot <IconArrowRight className="h-4 w-4" />
            </a>
            <a href="#gallery" className="btn-ghost justify-center bg-black/20 backdrop-blur-sm">
              View my work
            </a>
            <span
              aria-hidden
              className="font-script hidden items-center gap-2 pl-3 text-2xl text-[var(--accent-gold-bright)] [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] xl:inline-flex"
            >
              <ScribbleArrow className="h-8 w-10 -scale-x-100 rotate-[200deg]" /> Go on, have a look
            </span>
          </div>
          <p className="animate-fade-up mt-4 text-[0.95rem] text-[var(--text-primary)]/75" style={{ animationDelay: "0.65s" }}>
            {responsePromise}
          </p>
        </div>
      </div>
    </section>
  );
}
