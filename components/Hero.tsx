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
    <section id="home" className="relative flex h-screen min-h-[560px] w-full items-center overflow-hidden bg-[var(--bg-dark)]">
      {heroPhotoPath ? (
        <Image
          src={photoPublicUrl(heroPhotoPath)}
          alt={headline}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div className="max-w-xl">
          <p className="eyebrow">Capturing</p>
          <h1 className="font-serif-display mt-4 text-5xl font-semibold leading-tight text-[var(--text-primary)] sm:text-7xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            {tagline}
          </p>
          <a href="#gallery" className="btn-ghost mt-8">
            View my work <IconArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-8 z-10 flex flex-col gap-4 sm:inset-x-10 sm:flex-row sm:items-end sm:justify-between">
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
    </section>
  );
}
