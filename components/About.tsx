import Image from "next/image";
import { photoPublicUrl } from "@/lib/media";
import { site, locationLabel } from "@/lib/site";
import { IconCamera, IconPin, IconStar } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";

export default function About({
  bio,
  photoPath,
  photoCaption,
  photographerName,
}: {
  bio: string;
  photoPath: string | null;
  photoCaption: string;
  photographerName: string;
}) {
  const traits = [
    { icon: IconCamera, label: "Passionate about photography" },
    { icon: IconPin, label: `Based in ${locationLabel}` },
    { icon: IconStar, label: "Focused on quality & detail" },
  ];

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
            <span className="eyebrow">Who I am</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
            Hi, I&apos;m {photographerName}
          </h2>
          <Flourish />
          {bio ? (
            <p className="drop-cap mt-6 whitespace-pre-line text-[1.05rem] leading-relaxed text-[var(--text-secondary)] sm:text-[1.1rem]">
              {bio}
            </p>
          ) : null}

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {traits.map((trait, i) => (
              <Reveal key={trait.label} delay={150 + i * 90} className="flex flex-col gap-3">
                <trait.icon aria-hidden className="h-6 w-6 text-[var(--accent-gold)]" />
                <p className="text-base text-[var(--text-secondary)]">{trait.label}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
