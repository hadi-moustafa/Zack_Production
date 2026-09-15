import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { IconCamera, IconPin, IconStar } from "@/components/icons";

export default function About({
  bio,
  photoPath,
  photoCaption,
  photographerName,
  locationText,
}: {
  bio: string;
  photoPath: string | null;
  photoCaption: string;
  photographerName: string;
  locationText: string;
}) {
  const traits = [
    { icon: IconCamera, label: "Passionate about photography" },
    { icon: IconPin, label: locationText ? `Based in ${locationText}` : "Based on location" },
    { icon: IconStar, label: "Focused on quality & detail" },
  ];

  return (
    <section id="about" className="relative overflow-hidden bg-[var(--bg-dark-alt)] py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 sm:grid-cols-2 sm:items-center sm:px-10">
        <div className="relative flex items-center gap-4">
          {photoCaption ? (
            <span className="font-script hidden origin-left -rotate-90 whitespace-nowrap text-lg text-[var(--accent-gold)] sm:inline-block">
              {photoCaption}
            </span>
          ) : null}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-900 grayscale">
            {photoPath ? (
              <Image
                src={photoPublicUrl(photoPath)}
                alt={photographerName}
                fill
                loading="lazy"
                sizes="(min-width: 640px) 40vw, 90vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </div>

        <div>
          <p className="eyebrow">About me</p>
          <h2 className="font-serif-display mt-4 text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
            Hi, I&apos;m {photographerName}
          </h2>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[var(--text-secondary)]">
            {bio}
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {traits.map((trait) => (
              <div key={trait.label} className="flex flex-col gap-3">
                <trait.icon className="h-6 w-6 text-[var(--accent-gold)]" />
                <p className="text-sm text-[var(--text-secondary)]">{trait.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
