import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";

export default function About({
  bio,
  photoPath,
}: {
  bio: string;
  photoPath: string | null;
}) {
  return (
    <section id="about" className="mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:grid-cols-2 sm:items-center sm:px-12">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-100">
        {photoPath ? (
          <Image
            src={photoPublicUrl(photoPath)}
            alt="Photographer headshot"
            fill
            loading="lazy"
            sizes="(min-width: 640px) 40vw, 90vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
          About
        </h2>
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-neutral-700">
          {bio}
        </p>
      </div>
    </section>
  );
}
