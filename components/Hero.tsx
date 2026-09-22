import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { IconArrowRight, IconPin } from "@/components/icons";

export default function Hero({
  headline,
  tagline,
  scriptTagline,
  locationText,
  capabilityWords,
  signatureCredit,
  heroPhotoPath,
}: {
  headline: string;
  tagline: string;
  scriptTagline: string;
  locationText: string;
  capabilityWords: string;
  signatureCredit: string;
  heroPhotoPath: string | null;
}) {
  return (
    <section
      id="home"
      className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden bg-[var(--bg-dark)] sm:items-center"
    >
      <div className="letterbox-bar letterbox-top" />
      <div className="letterbox-bar letterbox-bottom" />

      {heroPhotoPath ? (
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
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/45 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-28 sm:px-10 sm:pb-0">
        <div className="max-w-xl">
          <p className="eyebrow animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Capturing
          </p>
          <h1
            className="font-serif-display animate-fade-up mt-4 text-[clamp(2.75rem,11vw,6.5rem)] font-semibold leading-[0.98] text-[var(--text-primary)]"
            style={{ animationDelay: "0.25s" }}
          >
            {headline}
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-md text-[clamp(0.95rem,2.6vw,1.15rem)] leading-relaxed text-[var(--text-secondary)]"
            style={{ animationDelay: "0.4s" }}
          >
            {tagline}
          </p>
          <div className="animate-fade-up mt-8" style={{ animationDelay: "0.55s" }}>
            <a href="#gallery" className="btn-ghost">
              View my work <IconArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-5 bottom-10 z-10 flex flex-col gap-4 sm:inset-x-10 sm:bottom-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {locationText ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <IconPin className="h-4 w-4 text-[var(--accent-gold)]" />
              {locationText}
            </div>
          ) : null}
          {scriptTagline ? (
            <p className="font-script mt-1 text-2xl text-[var(--text-primary)]">{scriptTagline}</p>
          ) : null}
        </div>

        <div className="text-left sm:text-right">
          {signatureCredit ? (
            <p className="font-script text-xl text-[var(--accent-gold)]">{signatureCredit}</p>
          ) : null}
          {capabilityWords ? (
            <p className="eyebrow mt-1 text-[0.65rem] tracking-[0.25em]">{capabilityWords}</p>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 sm:block">
        <span className="animate-scroll-cue block h-9 w-px bg-[var(--accent-gold)]" />
      </div>
    </section>
  );
}
