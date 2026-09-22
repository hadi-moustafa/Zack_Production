"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { STATIC_WORK_ITEMS } from "@/lib/staticWork";
import type { Photo } from "@/lib/types";
import Reveal from "@/components/Reveal";
import VideoTile from "@/components/VideoTile";
import { IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

const INITIAL_COUNT = 8;

type GalleryItem = {
  id: string;
  kind: "photo" | "video";
  category: string;
  src: string;
  caption?: string;
};

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

  const items = useMemo<GalleryItem[]>(() => {
    const fromDb: GalleryItem[] = photos.map((p) => ({
      id: p.id,
      kind: "photo",
      category: p.category,
      src: photoPublicUrl(p.storage_path),
      caption: p.caption,
    }));
    const fromStatic: GalleryItem[] = STATIC_WORK_ITEMS.map((w) => ({
      id: w.id,
      kind: w.kind,
      category: w.category,
      src: w.src,
      caption: w.caption,
    }));
    return [...fromDb, ...fromStatic];
  }, [photos]);

  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [items]);

  const visibleItems = useMemo(
    () => (activeCategory === "All" ? items : items.filter((p) => p.category === activeCategory)),
    [items, activeCategory]
  );

  const shownItems = showAll ? visibleItems : visibleItems.slice(0, INITIAL_COUNT);

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
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
          {visibleItems.length > INITIAL_COUNT ? (
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
          {shownItems.map((item, i) => {
            const spanClass = SPAN_PATTERN[i % SPAN_PATTERN.length];
            if (item.kind === "video") {
              return (
                <VideoTile
                  key={item.id}
                  src={item.src}
                  caption={item.caption}
                  className={spanClass}
                  onOpen={() => setLightboxIndex(i)}
                />
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => setLightboxIndex(i)}
                className={`group relative overflow-hidden rounded-md bg-neutral-900 ${spanClass}`}
              >
                <Image
                  src={item.src}
                  alt={item.caption || item.category}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 25vw, 45vw"
                  className="object-cover transition duration-500 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {item.caption ? (
                  <span className="absolute bottom-2 left-2.5 right-2.5 translate-y-2 text-left text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {item.caption}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          items={shownItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </section>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const item = items[index];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((index - 1 + items.length) % items.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((index + 1) % items.length);
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

      {items.length > 1 ? (
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-2 text-4xl text-white/70 hover:text-white sm:left-6"
        >
          &#8249;
        </button>
      ) : null}

      <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {item.kind === "video" ? (
          <LightboxVideo key={item.id} src={item.src} />
        ) : (
          <Image src={item.src} alt={item.caption || item.category} fill sizes="90vw" className="object-contain" />
        )}
      </div>

      {items.length > 1 ? (
        <button
          onClick={goNext}
          aria-label="Next"
          className="absolute right-2 text-4xl text-white/70 hover:text-white sm:right-6"
        >
          &#8250;
        </button>
      ) : null}

      {item.caption ? (
        <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/80">{item.caption}</p>
      ) : null}
    </div>
  );
}

function LightboxVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = !next;
    if (next) video.play().catch(() => {});
    setMuted(!next);
  }

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        autoPlay
        loop
        muted={muted}
        playsInline
      />
      <button
        type="button"
        data-no-sound
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
        className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
      >
        {muted ? <IconSpeakerOff className="h-4 w-4" /> : <IconSpeakerOn className="h-4 w-4" />}
      </button>
    </>
  );
}
