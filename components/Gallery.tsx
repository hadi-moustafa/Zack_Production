"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { photoPublicUrl, workAlt } from "@/lib/media";
import { sortCategories } from "@/lib/categories";
import type { Photo } from "@/lib/types";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";
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
  /** Still frame for videos, when one has been generated. */
  poster?: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [curtainClosed, setCurtainClosed] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const items = useMemo<GalleryItem[]>(
    () =>
      photos.map((p) => ({
        id: p.id,
        kind: p.media_type === "video" ? "video" : "photo",
        category: p.category,
        src: photoPublicUrl(p.storage_path),
        poster: p.poster_path ? photoPublicUrl(p.poster_path) : undefined,
        caption: p.caption,
      })),
    [photos]
  );

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

  // Swapping the tall category list for a shorter grid would otherwise leave
  // the viewport past the gallery (e.g. in Pricing on mobile), so jump back to
  // the section top while the curtain hides the change.
  function scrollToSectionTop() {
    const section = sectionRef.current;
    if (!section || section.getBoundingClientRect().top >= 0) return;
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  }

  function openCategory(cat: string) {
    if (cat === selectedCategory) return;
    setLightboxIndex(null);
    setCurtainClosed(true);
    setTimeout(() => {
      setSelectedCategory(cat);
      setShowAll(false);
      setCurtainClosed(false);
      scrollToSectionTop();
    }, CURTAIN_MS);
  }

  function backToCategories() {
    setLightboxIndex(null);
    setCurtainClosed(true);
    setTimeout(() => {
      setSelectedCategory(null);
      setCurtainClosed(false);
      scrollToSectionTop();
    }, CURTAIN_MS);
  }

  if (items.length === 0) return null;

  const heading =
    selectedCategory === null ? "Choose a Story" : selectedCategory === SHOWREEL_KEY ? "The Showreel" : selectedCategory;

  return (
    <section ref={sectionRef} id="gallery" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="section-index">
              <span className="num">I</span>
              <span className="line" />
              <span className="eyebrow">My work</span>
            </div>
            <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
              {heading}
            </h2>
            <Flourish />
          </div>

          {selectedCategory !== null ? (
            <button
              onClick={backToCategories}
              className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold-bright)] hover:opacity-80"
            >
              ← All categories
            </button>
          ) : null}
        </Reveal>

        {selectedCategory === null ? (
          <div className="mt-10 flex flex-col gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-4">
            <Reveal>
              <CategoryCard
                label="Showreel"
                sublabel="A taste of everything"
                mosaic={showreelItems.slice(0, 4)}
                onClick={() => openCategory(SHOWREEL_KEY)}
              />
            </Reveal>
            {categories.map((cat, i) => (
              <Reveal key={cat} delay={(i + 1) * 60}>
                <CategoryCard
                  label={cat}
                  sublabel={pieces(items.filter((it) => it.category === cat).length)}
                  cover={coverByCategory.get(cat)}
                  onClick={() => openCategory(cat)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-10 grid auto-rows-[13rem] grid-cols-1 gap-2.5 sm:auto-rows-[10rem] sm:grid-cols-4 sm:gap-4">
              {shownItems.map((item, i) => {
                const spanClass = SPAN_PATTERN[i % SPAN_PATTERN.length];
                if (item.kind === "video") {
                  return (
                    <VideoTile
                      key={item.id}
                      src={item.src}
                      poster={item.poster}
                      caption={item.caption}
                      label={workAlt(item.category, "video", item.caption)}
                      className={spanClass}
                      onOpen={() => setLightboxIndex(i)}
                    />
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Enlarge: ${workAlt(item.category, "photo", item.caption)}`}
                    className={`group relative overflow-hidden rounded-md bg-neutral-900 ${spanClass}`}
                  >
                    <Image
                      src={item.src}
                      alt={workAlt(item.category, "photo", item.caption)}
                      fill
                      loading="lazy"
                      sizes="(min-width: 768px) 25vw, 45vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-110"
                    />
                    {item.caption ? (
                      <>
                        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/0" />
                        <span aria-hidden className="absolute bottom-2.5 left-3 right-3 text-left text-sm font-medium text-white">
                          {item.caption}
                        </span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedCategory !== SHOWREEL_KEY && visibleItems.length > INITIAL_COUNT ? (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-widest text-[var(--accent-gold-bright)] hover:opacity-80"
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

function pieces(n: number) {
  return `${n} ${n === 1 ? "piece" : "pieces"}`;
}

function CurtainOverlay({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 flex">
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
  const still = item.kind === "video" ? item.poster : item.src;
  if (!still) {
    return (
      <video aria-hidden src={`${item.src}#t=0.5`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
    );
  }
  return <Image src={still} alt="" aria-hidden fill sizes="(min-width: 640px) 25vw, 224px" className="object-cover" />;
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
        <p className="mt-1 text-[0.8rem] uppercase tracking-widest text-white/80">{sublabel}</p>
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
  const closeRef = useRef<HTMLButtonElement>(null);

  const prev = () => onNavigate((index - 1 + items.length) % items.length);
  const next = () => onNavigate((index + 1) % items.length);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && items.length > 1) prev();
      else if (e.key === "ArrowRight" && items.length > 1) next();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  const control =
    "absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-3xl leading-none text-white/85 transition hover:bg-black/70 hover:text-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={workAlt(item.category, item.kind, item.caption)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <button ref={closeRef} onClick={onClose} aria-label="Close" className={`${control} right-3 top-3`}>
        &times;
      </button>

      {items.length > 1 ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Previous"
          className={`${control} left-2 sm:left-6`}
        >
          &#8249;
        </button>
      ) : null}

      <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {item.kind === "video" ? (
          <LightboxVideo key={item.id} src={item.src} poster={item.poster} />
        ) : (
          <Image src={item.src} alt={workAlt(item.category, "photo", item.caption)} fill sizes="90vw" className="object-contain" />
        )}
      </div>

      {items.length > 1 ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Next"
          className={`${control} right-2 sm:right-6`}
        >
          &#8250;
        </button>
      ) : null}

      {item.caption ? (
        <p className="absolute bottom-6 left-0 right-0 px-6 text-center text-white/85">{item.caption}</p>
      ) : null}
    </div>
  );
}

function LightboxVideo({ src, poster }: { src: string; poster?: string }) {
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
        poster={poster}
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
        className="absolute bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
      >
        {muted ? <IconSpeakerOff className="h-4 w-4" /> : <IconSpeakerOn className="h-4 w-4" />}
      </button>
    </>
  );
}
