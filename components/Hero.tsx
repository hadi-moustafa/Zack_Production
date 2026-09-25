import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { publicFileExists } from "@/lib/publicAsset";
import { IconArrowRight } from "@/components/icons";
import HeroVideo from "@/components/HeroVideo";
import { ScribbleArrow } from "@/components/Ornaments";

const HERO_VIDEO_MP4 = "/videos/hero.mp4";
const HERO_VIDEO_WEBM = "/videos/hero.webm";

export default function Hero({
  headline,
  tagline,
  heroPhotoPath,
}: {
  headline: string;
  tagline: string;
  heroPhotoPath: string | null;
}) {
  const hasMp4 = publicFileExists("videos/hero.mp4");
  const hasWebm = publicFileExists("videos/hero.webm");
  const hasVideo = hasMp4 || hasWebm;
  const heroPoster = heroPhotoPath ? photoPublicUrl(heroPhotoPath) : undefined;

  return (
    <section
      id="home"
      className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden bg-[var(--bg-dark)]"
    >
      <div className="letterbox-bar letterbox-top" />
      <div className="letterbox-bar letterbox-bottom" />

      {hasVideo ? (
        <HeroVideo
          mp4Src={hasMp4 ? HERO_VIDEO_MP4 : undefined}
          webmSrc={hasWebm ? HERO_VIDEO_WEBM : undefined}
          poster={heroPoster}
        />
      ) : heroPhotoPath ? (
        <div className="absolute inset-0">
          <Image
            src={photoPublicUrl(heroPhotoPath)}
            alt={headline}
            fill
            priority
            sizes="100vw"
            className="animate-ken-burns object-cover"
          />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />

      <span className="vf-corner vf-tl" />
      <span className="vf-corner vf-tr" />
      <span className="vf-corner vf-bl" />
      <span className="vf-corner vf-br" />
      <p className="eyebrow absolute right-[clamp(16px,4vw,48px)] top-[clamp(76px,11vw,120px)] z-20 hidden items-center gap-2 !text-[var(--text-primary)]/80 sm:flex">
        <span className="rec-dot inline-block h-2 w-2 rounded-full bg-red-600" /> REC · ISO 400 · f/1.8
      </p>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-10 sm:pb-20">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Capturing
          </p>
          <h1
            className="font-serif-display animate-fade-up mt-4 text-[clamp(2.5rem,10vw,6.5rem)] font-semibold leading-[0.98] text-[var(--text-primary)]"
            style={{ animationDelay: "0.25s" }}
          >
            {headline}
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-md text-[clamp(0.9rem,2.6vw,1.15rem)] leading-relaxed text-[var(--text-secondary)]"
            style={{ animationDelay: "0.4s" }}
          >
            {tagline}
          </p>
          <div className="animate-fade-up mt-8" style={{ animationDelay: "0.55s" }}>
            <a href="#gallery" className="btn-ghost">
              View my work <IconArrowRight className="h-4 w-4" />
            </a>
            <span className="font-script ml-3 hidden -rotate-3 items-center gap-1 text-2xl text-[var(--accent-gold-bright)] sm:inline-flex">
              <ScribbleArrow className="h-8 w-10 -scale-x-100 rotate-[200deg]" /> go on, have a look
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
