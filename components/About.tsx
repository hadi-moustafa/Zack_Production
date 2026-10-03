import Image from "next/image";
import { photoPublicUrl } from "@/lib/media";
import { site } from "@/lib/site";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";

export default function About({
  bio,
  photoPath,
  photoCaption,
  photographerName,
  fullName,
  roles,
  award,
  tagline,
}: {
  bio: string;
  photoPath: string | null;
  photoCaption: string;
  photographerName: string;
  fullName: string;
  roles: string;
  award: string;
  tagline: string;
}) {
  const paragraphs = bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const roleList = roles.split(/[·•|]/).map((r) => r.trim()).filter(Boolean);
  // "Best Director of Photography — Afdal Awards 2025 & 2026" → title + where/when
  const [awardTitle, awardDetail] = award.split(/\s+[—–-]\s+/, 2);

  return (
    <section id="about" className="relative overflow-hidden bg-[var(--bg-dark-alt)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:gap-12 sm:px-10 lg:grid-cols-2 lg:items-center">
        {photoPath ? (
          <Reveal className="relative px-4 py-8">
            <div className="print relative mx-auto w-full max-w-md">
              <span aria-hidden className="tape tape-tl" />
              <span aria-hidden className="tape tape-br" />
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={photoPublicUrl(photoPath)}
                  alt={`${site.founder}, photographer and filmmaker at ${site.name}`}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover sepia-[0.25] transition duration-700 hover:sepia-0"
                />
              </div>
              {photoCaption ? (
                <p className="font-script absolute inset-x-0 bottom-3 text-center text-2xl text-[#2a2620]">
                  {photoCaption}
                </p>
        ) : null}
          </div>
        </Reveal>
        ) : null}

        <Reveal delay={120}>
          <div className="section-index">
            <span className="num">II</span>
            <span className="line" />
            <span className="eyebrow">Who we are</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
            Hi, I&apos;m {photographerName}
            <span className="sr-only"> – </span>
            <span className="mt-3 block font-serif-display text-[clamp(1.35rem,4.5vw,1.9rem)] font-normal italic leading-snug text-[var(--accent-gold-bright)]">
              Professional Photographer &amp; Videographer
            </span>
          </h2>
          <Flourish />

          {fullName || roleList.length ? (
            <div className="mt-8">
              {fullName ? (
                <p className="font-mono text-[0.85rem] font-medium uppercase tracking-[0.32em] text-[var(--text-primary)]">
                  {fullName}
                </p>
              ) : null}
              {roleList.length ? (
                <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] text-[var(--accent-gold-bright)]">
                  {roleList.map((role, i) => (
                    <li key={role} className="flex items-center gap-3">
                      {i > 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--accent-gold)]" /> : null}
                      {role}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`${i === 0 ? "drop-cap mt-6" : "mt-4"} text-[1.05rem] leading-relaxed text-[var(--text-secondary)] sm:text-[1.1rem]`}
            >
              {p}
            </p>
          ))}

          {award ? (
            <div className="mt-8 flex items-center gap-4 rounded-xl border border-[var(--accent-gold)]/45 bg-[var(--accent-gold)]/[0.07] p-4 sm:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--accent-gold-bright)]/60 text-[var(--accent-gold-bright)]">
                <AwardIcon className="h-6 w-6" />
              </span>
              <p>
                <span className="block font-semibold text-[var(--text-primary)]">{awardTitle}</span>
                {awardDetail ? <span className="block text-[0.95rem] text-[var(--accent-gold-bright)]">{awardDetail}</span> : null}
              </p>
            </div>
          ) : null}

          {tagline ? (
            <p className="font-script mt-8 flex items-center gap-4 text-[clamp(1.25rem,4vw,1.6rem)] text-[var(--text-primary)]">
              <span aria-hidden className="h-px w-10 shrink-0 bg-[var(--accent-gold)]" />
              {tagline}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

// Laurel-wrapped star for the award highlight.
function AwardIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden className={className}>
      <path d="M12 6.2l1.4 2.9 3.1.4-2.3 2.2.6 3.1L12 13.3l-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" fill="currentColor" stroke="none" />
      <path d="M5.5 7.5c-1.6 2.6-1.4 6 .6 8.4 1.5 1.8 3.7 2.8 5.9 2.8M18.5 7.5c1.6 2.6 1.4 6-.6 8.4-1.5 1.8-3.7 2.8-5.9 2.8" />
      <path d="M4.6 11.2l-1.4-.8M4.9 14.4l-1.5.1M6.6 17.2l-1.2.9M19.4 11.2l1.4-.8M19.1 14.4l1.5.1M17.4 17.2l1.2.9" />
      <path d="M12 18.7V21M9.5 21h5" />
    </svg>
  );
}
