"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { STATIC_WORK_ITEMS } from "@/lib/staticWork";
import { sortCategories } from "@/lib/categories";
import type { Photo } from "@/lib/types";
import Reveal from "@/components/Reveal";
import VideoTile from "@/components/VideoTile";
import { IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

const INITIAL_COUNT = 8;
const SHOWREEL_KEY = "__showreel__";
const SHOWREEL_CAP = 12;
const CURTAIN_MS = 550;

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

export default function Gallery({
  photos,
  includeStaticWork = true,
}: {
  photos: Photo[];
  /** Set to false once the built-in media has been imported into the DB, to avoid showing it twice. */
  includeStaticWork?: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [curtainClosed, setCurtainClosed] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const items = useMemo<GalleryItem[]>(() => {
    const fromDb: GalleryItem[] = photos.map((p) => ({
      id: p.id,
      kind: p.media_type === "video" ? "video" : "photo",
      category: p.category,
      src: photoPublicUrl(p.storage_path),
      caption: p.caption,
    }));
    const fromStatic: GalleryItem[] = includeStaticWork
      ? STATIC_WORK_ITEMS.map((w) => ({
          id: w.id,
          kind: w.kind,
          category: w.category,
          src: w.src,
          caption: w.caption,
        }))
      : [];
    return [...fromDb, ...fromStatic];
  }, [photos, includeStaticWork]);

  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    set.delete("Featured");
    return sortCategories(Array.from(set));
  }, [items]);

  const coverByCategory = useMemo(() => {
    const map = new Map<string, GalleryItem>();
    for (const cat of categories) {
      const found = items.find((i) => i.category === cat);
      if (found) map.set(cat, found);
    }
    return map;
  }, [items, categories]);

  // A curated sample across every category — a taste of the whole reel,
  // rather than every single item dumped in one place.
  const showreelItems = useMemo(() => {
    const picks: GalleryItem[] = [];
    for (const cat of categories) {
      const inCategory = items.filter((i) => i.category === cat);
      const video = inCategory.find((i) => i.kind === "video");
      const photosInCat = inCategory.filter((i) => i.kind === "photo");
      if (video) picks.push(video, ...photosInCat.slice(0, 1));
      else picks.push(...photosInCat.slice(0, 2));
    }
    return picks.slice(0, SHOWREEL_CAP);
  }, [items, categories]);

  const visibleItems = useMemo(() => {
    if (selectedCategory === null) return [];
    if (selectedCategory === SHOWREEL_KEY) return showreelItems;
    return items.filter((i) => i.category === selectedCategory);
  }, [items, selectedCategory, showreelItems]);

  const shownItems =
    selectedCategory === SHOWREEL_KEY ? visibleItems : showAll ? visibleItems : visibleItems.slice(0, INITIAL_COUNT);

  function openCategory(cat: string) {
    if (cat === selectedCategory) return;
    setLightboxIndex(null);
    setCurtainClosed(true);
    setTimeout(() => {
      setSelectedCategory(cat);
      setShowAll(false);
      setCurtainClosed(false);
    }, CURTAIN_MS);
  }

  function backToCategories() {
    setLightboxIndex(null);
    setCurtainClosed(true);
    setTimeout(() => {
      setSelectedCategory(null);
      setCurtainClosed(false);
    }, CURTAIN_MS);
  }

  if (items.length === 0) return null;

  const heading =
    selectedCategory === null ? "Choose a Story" : selectedCategory === SHOWREEL_KEY ? "The Showreel" : selectedCategory;

  return (
    <section id="gallery" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="section-index">
              <span className="num">01</span>
              <span className="line" />
              <span className="eyebrow">My work</span>
            </div>
            <h2 className="font-serif-display mt-4 text-[clamp(2.25rem,7vw,3.75rem)] font-semibold leading-[1.02] text-[var(--text-primary)]">
              {heading}
            </h2>
          </div>

          {selectedCategory !== null ? (
            <button
              onClick={backToCategories}
              className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold)] hover:opacity-80"
            >
              ← All categories
            </button>
          ) : null}
        </Reveal>

        {selectedCategory === null ? (
          <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            <Reveal className="shrink-0 snap-start sm:shrink sm:snap-align-none">
              <CategoryCard
                label="Showreel"
                sublabel="A taste of everything"
                mosaic={showreelItems.slice(0, 4)}
                onClick={() => openCategory(SHOWREEL_KEY)}
              />
            </Reveal>
            {categories.map((cat, i) => (
              <Reveal key={cat} delay={(i + 1) * 60} className="shrink-0 snap-start sm:shrink sm:snap-align-none">
                <CategoryCard
                  label={cat}
                  sublabel={`${items.filter((it) => it.category === cat).length} pieces`}
                  cover={coverByCategory.get(cat)}
                  onClick={() => openCategory(cat)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <>
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
                      suspended={lightboxIndex !== null}
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

            {selectedCategory !== SHOWREEL_KEY && visibleItems.length > INITIAL_COUNT ? (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold)] hover:opacity-80"
                >
                  {showAll ? "View less" : "View more →"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <CurtainOverlay active={curtainClosed} />

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

function CurtainOverlay({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex">
      <div
        className={`h-full w-1/2 bg-[var(--bg-dark)] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          active ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <div
        className={`h-full w-1/2 bg-[var(--bg-dark)] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          active ? "translate-x-0" : "translate-x-full"
        }`}
      />
    </div>
  );
}

function MediaThumb({ item }: { item: GalleryItem }) {
  if (item.kind === "video") {
    return (
      <video src={item.src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
    );
  }
  return <Image src={item.src} alt="" fill sizes="320px" className="object-cover" />;
}

function CategoryCard({
  label,
  sublabel,
  cover,
  mosaic,
  onClick,
}: {
  label: string;
  sublabel: string;
  cover?: GalleryItem;
  mosaic?: GalleryItem[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-[3/4] w-56 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-neutral-900 transition hover:border-[var(--accent-gold)] sm:w-full"
    >
      {mosaic && mosaic.length > 0 ? (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
          {mosaic.slice(0, 4).map((m) => (
            <div key={m.id} className="relative overflow-hidden bg-neutral-800">
              <MediaThumb item={m} />
            </div>
          ))}
        </div>
      ) : cover ? (
        <div className="absolute inset-0">
          <MediaThumb item={cover} />
        </div>
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10 transition group-hover:from-black/75" />

      <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--accent-gold)]/70 transition group-hover:border-[var(--accent-gold)]" />
      <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--accent-gold)]/70 transition group-hover:border-[var(--accent-gold)]" />
      <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--accent-gold)]/70 transition group-hover:border-[var(--accent-gold)]" />
      <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--accent-gold)]/70 transition group-hover:border-[var(--accent-gold)]" />

      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
        <p className="font-serif-display text-xl font-semibold text-white transition group-hover:text-[var(--accent-gold)]">
          {label}
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-white/60">{sublabel}</p>
      </div>
    </button>
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
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (!nextMuted) video.play().catch(() => {});
    setMuted(nextMuted);
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
