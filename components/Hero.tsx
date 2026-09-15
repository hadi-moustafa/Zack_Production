import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";

export default function Hero({
  photographerName,
  tagline,
  heroPhotoPath,
}: {
  photographerName: string;
  tagline: string;
  heroPhotoPath: string | null;
}) {
  return (
    <section className="relative flex h-[85vh] min-h-[480px] w-full items-end justify-start overflow-hidden bg-neutral-900 text-white">
      {heroPhotoPath ? (
        <Image
          src={photoPublicUrl(heroPhotoPath)}
          alt={photographerName}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative z-10 max-w-3xl px-6 pb-16 sm:px-12 sm:pb-20">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {photographerName}
        </h1>
        <p className="mt-4 text-lg text-neutral-200 sm:text-xl">{tagline}</p>
      </div>
    </section>
  );
}
