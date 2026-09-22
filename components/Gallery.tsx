"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import type { Photo } from "@/lib/types";
import Reveal from "@/components/Reveal";

const INITIAL_COUNT = 8;

// Cycle of grid spans to create a masonry-like, variable-width layout.
const SPAN_PATTERN = [
  "sm:col-span-2 sm:row-span-2", // large square
  "row-span-1",
  "row-span-2", // portrait
  "sm:col-span-2", // landscape
  "row-span-1",
  "row-span-2",
];

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

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

  const shownPhotos = showAll ? visiblePhotos : visiblePhotos.slice(0, INITIAL_COUNT);

  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal playSound className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="section-index">
              <span className="num">01</span>
              <span className="line" />
              <span className="eyebrow">My work</span>
            </div>
            <h2 className="font-serif-display mt-4 text-[clamp(2.25rem,7vw,3.75rem)] font-semibold leading-[1.02] text-[var(--text-primary)]">
              Featured Gallery
            </h2>
          </div>
          {visiblePhotos.length > INITIAL_COUNT ? (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold)] hover:opacity-80"
            >
              {showAll ? "View less" : "View more →"}
            </button>
          ) : null}
        </Reveal>

        {categories.length > 2 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setShowAll(false);
                }}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  activeCategory === cat
                    ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-10 grid auto-rows-[9rem] grid-cols-2 gap-2.5 sm:auto-rows-[10rem] sm:grid-cols-4 sm:gap-4">
          {shownPhotos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(i)}
              className={`group relative overflow-hidden rounded-md bg-neutral-900 ${SPAN_PATTERN[i % SPAN_PATTERN.length]}`}
            >
              <Image
                src={photoPublicUrl(photo.storage_path)}
                alt={photo.caption || photo.category}
                fill
                loading="lazy"
                sizes="(min-width: 768px) 25vw, 45vw"
                className="object-cover transition duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {photo.caption ? (
                <span className="absolute bottom-2 left-2.5 right-2.5 translate-y-2 text-left text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.caption}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          photos={shownPhotos}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
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
