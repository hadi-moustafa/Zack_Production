"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import type { Photo } from "@/lib/types";

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set(photos.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [photos]);

  const visiblePhotos = useMemo(
    () =>
      activeCategory === "All"
        ? photos
        : photos.filter((p) => p.category === activeCategory),
    [photos, activeCategory]
  );

  if (photos.length === 0) return null;

  return (
    <section id="portfolio" className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
        Portfolio
      </h2>

      {categories.length > 2 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                activeCategory === cat
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
        {visiblePhotos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-md bg-neutral-100"
          >
            <Image
              src={photoPublicUrl(photo.storage_path)}
              alt={photo.caption || photo.category}
              fill
              loading="lazy"
              sizes="(min-width: 768px) 30vw, 45vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          photos={visiblePhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </section>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const photo = photos[index];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((index - 1 + photos.length) % photos.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((index + 1) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 text-3xl leading-none text-white/80 hover:text-white"
      >
        &times;
      </button>

      {photos.length > 1 ? (
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-2 text-4xl text-white/70 hover:text-white sm:left-6"
        >
          &#8249;
        </button>
      ) : null}

      <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={photoPublicUrl(photo.storage_path)}
          alt={photo.caption || photo.category}
          fill
          sizes="90vw"
          className="object-contain"
        />
      </div>

      {photos.length > 1 ? (
        <button
          onClick={goNext}
          aria-label="Next"
          className="absolute right-2 text-4xl text-white/70 hover:text-white sm:right-6"
        >
          &#8250;
        </button>
      ) : null}

      {photo.caption ? (
        <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/80">
          {photo.caption}
        </p>
      ) : null}
    </div>
  );
}
