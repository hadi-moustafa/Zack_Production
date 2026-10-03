"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { photoPublicUrl, workAlt } from "@/lib/media";
import { byOrder } from "@/lib/categories";
import type { Category, Photo } from "@/lib/types";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";
import { IconArrowRight, IconPlay, IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

// Work is an index you step into, never one endless feed:
//   Highlights (default) → category tiles + a curated selection
//   A category           → its own header, a Films | Photos switch, and a
//                          way back to all categories

const HIGHLIGHTS = "highlights";
const PHOTO_PAGE = 16;
const FILM_PAGE = 8;

type Item = {
  id: string;
  kind: "photo" | "video";
  src: string;
  /** Still image to show: the photo itself, or a film's preview frame. */
  still?: string;
  blur?: string;
  width: number;
  height: number;
  caption: string;
  featured: boolean;
  category: Category;
  label: string;
};

type Group = {
  category: Category;
  films: Item[];
  photos: Item[];
  cover?: Item;
};

function toItem(p: Photo, category: Category): Item {
  const isVideo = p.media_type === "video";
  return {
    id: p.id,
    kind: isVideo ? "video" : "photo",
    src: photoPublicUrl(p.storage_path),
    still: isVideo ? (p.poster_path ? photoPublicUrl(p.poster_path) : undefined) : photoPublicUrl(p.storage_path),
    blur: p.blur_data ?? undefined,
    width: p.width ?? (isVideo ? 720 : 1600),
    height: p.height ?? (isVideo ? 1280 : 2000),
    caption: p.caption.trim(),
    featured: p.featured,
    category,
    label: workAlt(category.name, isVideo ? "video" : "photo", p.caption),
  };
}

function plural(n: number, word: string, many = `${word}s`) {
  return `${n} ${n === 1 ? word : many}`;
}

function countLabel(g: { films: unknown[]; photos: unknown[] }) {
  return [g.films.length ? plural(g.films.length, "film") : "", g.photos.length ? plural(g.photos.length, "photo") : ""]
    .filter(Boolean)
    .join(" · ");
}

/** Your ★ picks; if fewer than a handful, a balanced pick from every category. */
function pickHighlights(groups: Group[], kind: "films" | "photos", max: number, perCategory: number) {
  const starred = groups.flatMap((g) => g[kind].filter((i) => i.featured));
  if (starred.length >= Math.min(4, max)) return starred.slice(0, max);
  const picks = [...starred];
  for (let round = 0; picks.length < max && round < perCategory; round++) {
    for (const g of groups) {
      const next = g[kind].filter((i) => !i.featured)[round];
      if (next && picks.length < max) picks.push(next);
    }
  }
  return picks;
}

export default function Work({ photos, categories }: { photos: Photo[]; categories: Category[] }) {
  const groups = useMemo<Group[]>(() => {
    const visible = categories.filter((c) => c.visible).sort(byOrder);
    const ordered = [...photos].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);
    return visible
      .map((category) => {
        const mine = ordered.filter((p) => p.category_id === category.id).map((p) => toItem(p, category));
        const films = mine.filter((i) => i.kind === "video" && category.kind !== "photo");
        const stills = mine.filter((i) => i.kind === "photo" && category.kind !== "video");
        const chosen = category.cover_path ? mine.find((i) => i.still?.endsWith(category.cover_path!)) : undefined;
        const custom: Item | undefined =
          category.cover_path && !chosen
            ? { ...(mine[0] ?? ({} as Item)), still: photoPublicUrl(category.cover_path), blur: undefined }
            : chosen;
        return { category, films, photos: stills, cover: custom ?? stills[0] ?? films.find((f) => f.still) };
      })
      .filter((g) => g.films.length + g.photos.length > 0);
  }, [photos, categories]);

  const [active, setActive] = useState(HIGHLIGHTS);
  const [view, setView] = useState<"films" | "photos">("films");
  const [open, setOpen] = useState<{ list: Item[]; index: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const group = groups.find((g) => g.category.slug === active);
  const defaultView = (g: Group) => (g.films.length ? "films" : "photos");

  // Deep links: ?work=weddings&view=photos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = groups.find((x) => x.category.slug === params.get("work"));
    if (!g) return;
    const v = params.get("view");
    // One-time read of the URL after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(g.category.slug);
    setView(v === "photos" && g.photos.length ? "photos" : v === "films" && g.films.length ? "films" : defaultView(g));
  }, [groups]);

  const syncUrl = useCallback((slug: string, v?: string) => {
    const url = new URL(window.location.href);
    if (slug === HIGHLIGHTS) {
      url.searchParams.delete("work");
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("work", slug);
      if (v) url.searchParams.set("view", v);
    }
    window.history.replaceState(null, "", url);
  }, []);

  function go(slug: string) {
    const g = groups.find((x) => x.category.slug === slug);
    const v = g ? defaultView(g) : "films";
    setActive(slug);
    setView(v);
    syncUrl(slug, g ? v : undefined);
    // Bring the start of the new content into view, just under the nav.
    const top = contentRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - 112, behavior: "smooth" });
    }
  }

  function switchView(v: "films" | "photos") {
    setView(v);
    syncUrl(active, v);
  }

  if (groups.length === 0) return null;
  const filmTotal = groups.reduce((n, g) => n + g.films.length, 0);
  const photoTotal = groups.reduce((n, g) => n + g.photos.length, 0);
  const summary = [filmTotal ? plural(filmTotal, "film") : "", photoTotal ? plural(photoTotal, "photograph") : ""]
    .filter(Boolean)
    .join(" and ");

  return (
    <section id="gallery" className="relative bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal>
          <div className="section-index">
            <span className="num">I</span>
            <span className="line" />
            <span className="eyebrow">Our work</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
            Selected Work
          </h2>
          <Flourish />
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-[var(--text-secondary)]">
            {summary} across {plural(groups.length, "category", "categories")}. Pick a category to step inside, or
            start with the highlights below.
          </p>
        </Reveal>
      </div>

      <div ref={contentRef} className="mx-auto mt-10 max-w-6xl scroll-mt-28 px-5 sm:px-10">
        {group ? (
          <CategoryView
            key={group.category.id}
            group={group}
            view={group[view].length ? view : defaultView(group)}
            onView={switchView}
            onOpen={(list, index) => setOpen({ list, index })}
            onBack={() => go(HIGHLIGHTS)}
          />
        ) : (
          <HighlightsView groups={groups} onGo={go} onOpen={(list, index) => setOpen({ list, index })} />
        )}
      </div>

      {open ? (
        <Lightbox
          items={open.list}
          index={open.index}
          onClose={() => setOpen(null)}
          onNavigate={(index) => setOpen((o) => (o ? { ...o, index } : o))}
        />
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Highlights: the front door. Category tiles, then a curated selection.

function HighlightsView({
  groups,
  onGo,
  onOpen,
}: {
  groups: Group[];
  onGo: (slug: string) => void;
  onOpen: (list: Item[], index: number) => void;
}) {
  const films = pickHighlights(groups, "films", 8, 2);
  const stills = pickHighlights(groups, "photos", 12, 4);

  return (
    <>
      <p className="eyebrow">Explore by category</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {groups.map((g) => (
          <li key={g.category.id}>
            <button
              type="button"
              onClick={() => onGo(g.category.slug)}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-900 text-left sm:aspect-[5/4] lg:aspect-[4/3]"
            >
              {g.cover?.still ? (
                <Image
                  src={g.cover.still}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  placeholder={g.cover.blur ? "blur" : "empty"}
                  blurDataURL={g.cover.blur}
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                />
              ) : null}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />
              <span aria-hidden className="absolute left-3 top-3 h-4 w-4 border-l border-t border-[var(--accent-gold-bright)]/70" />
              <span aria-hidden className="absolute right-3 top-3 h-4 w-4 border-r border-t border-[var(--accent-gold-bright)]/70" />
              <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="font-serif-display block text-[clamp(1.3rem,4.5vw,1.9rem)] font-semibold leading-tight text-white">
                  {g.category.name}
                </span>
                <span className="mt-1 block text-[0.8rem] uppercase tracking-[0.14em] text-white/80">{countLabel(g)}</span>
                <span className="mt-3 hidden items-center gap-1.5 text-sm font-semibold text-[var(--accent-gold-bright)] sm:inline-flex">
                  Open <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {films.length ? (
        <div className="mt-16">
          <PartHeading title="Highlight films" />
          <FilmGrid films={films} limit={films.length} onOpen={(i) => onOpen(films, i)} showCategory />
        </div>
      ) : null}

      {stills.length ? (
        <div className="mt-16">
          <PartHeading title="Highlight photos" />
          <PhotoGrid photos={stills} limit={stills.length} onOpen={(i) => onOpen(stills, i)} />
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// One category: header, Films | Photos switch, then that list.

function CategoryView({
  group,
  view,
  onView,
  onOpen,
  onBack,
}: {
  group: Group;
  view: "films" | "photos";
  onView: (v: "films" | "photos") => void;
  onOpen: (list: Item[], index: number) => void;
  onBack: () => void;
}) {
  const [filmLimit, setFilmLimit] = useState(FILM_PAGE);
  const [photoLimit, setPhotoLimit] = useState(PHOTO_PAGE);
  const list = group[view];
  const both = group.films.length > 0 && group.photos.length > 0;

  return (
    <>
      <BackButton onClick={onBack} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h3 className="font-serif-display text-[clamp(2.25rem,8vw,3.5rem)] font-medium italic leading-none text-[var(--text-primary)]">
            {group.category.name}
          </h3>
          {group.category.description ? (
            <p className="mt-3 max-w-xl text-[1.05rem] text-[var(--text-secondary)]">{group.category.description}</p>
          ) : null}
        </div>
        {both ? (
          <div role="group" aria-label="Show films or photos" className="flex rounded-full border border-[var(--border-subtle)] p-1">
            {(["films", "photos"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => onView(v)}
                className={`min-h-11 rounded-full px-5 text-[0.95rem] font-semibold transition ${
                  view === v ? "bg-[var(--text-primary)] text-[#0a0a0a]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {v === "films" ? "Films" : "Photos"}{" "}
                <span className="tabular-nums opacity-70">{group[v].length}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="eyebrow">{countLabel(group)}</p>
        )}
      </div>

      <div className="mt-8">
        {view === "films" ? (
          <FilmGrid films={list} limit={filmLimit} onOpen={(i) => onOpen(list, i)} />
        ) : (
          <PhotoGrid photos={list} limit={photoLimit} onOpen={(i) => onOpen(list, i)} />
        )}
        <ShowMore
          shown={view === "films" ? filmLimit : photoLimit}
          total={list.length}
          noun={view === "films" ? "film" : "photo"}
          onMore={() => (view === "films" ? setFilmLimit((n) => n + FILM_PAGE) : setPhotoLimit((n) => n + PHOTO_PAGE))}
        />
        <div className="mt-12 flex justify-center border-t border-[var(--border-subtle)] pt-8">
          <BackButton onClick={onBack} />
        </div>
      </div>
    </>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[var(--accent-gold-bright)]/70 bg-[var(--accent-gold)]/10 px-5 text-[0.95rem] font-semibold text-[var(--accent-gold-bright)] transition hover:bg-[var(--accent-gold)] hover:text-[#0a0a0a]"
    >
      <IconArrowRight aria-hidden className="h-4 w-4 rotate-180 transition group-hover:-translate-x-1" />
      All categories
    </button>
  );
}

function PartHeading({ title }: { title: string }) {
  return (
    <div className="mb-6 border-b border-[var(--border-subtle)] pb-3">
      <h3 className="font-serif-display text-[clamp(1.6rem,5.5vw,2.25rem)] font-medium leading-none text-[var(--text-primary)]">
        {title}
      </h3>
    </div>
  );
}

function ShowMore({ shown, total, noun, onMore }: { shown: number; total: number; noun: string; onMore: () => void }) {
  if (total <= shown) return null;
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="text-[0.95rem] text-[var(--text-secondary)]">
        Showing {shown} of {total}
      </p>
      <div className="h-px w-40 overflow-hidden bg-[var(--border-subtle)]">
        <div className="h-full bg-[var(--accent-gold)]" style={{ width: `${(shown / total) * 100}%` }} />
      </div>
      <button type="button" onClick={onMore} className="btn-ghost mt-1">
        Show more {noun}s
      </button>
    </div>
  );
}

// Uniform vertical cards: nearly all films are 9:16 reels, so a tidy grid
// reads better than a strip. Only previews load until a film is opened.
function FilmGrid({
  films,
  limit,
  onOpen,
  showCategory = false,
}: {
  films: Item[];
  limit: number;
  onOpen: (index: number) => void;
  showCategory?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {films.slice(0, limit).map((item, i) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Play: ${item.label}`}
            className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-neutral-900"
          >
            {item.still ? (
              <Image
                src={item.still}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                placeholder={item.blur ? "blur" : "empty"}
                blurDataURL={item.blur}
                className="object-cover transition duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <video aria-hidden src={`${item.src}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/40 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-[var(--accent-gold-bright)] group-hover:text-[var(--accent-gold-bright)]"
            >
              <IconPlay className="ml-0.5 h-5 w-5" />
            </span>
            {item.caption || showCategory ? (
              <span aria-hidden className="absolute inset-x-3 bottom-3 text-left">
                {showCategory ? (
                  <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-[var(--accent-gold-bright)]">
                    {item.category.name}
                  </span>
                ) : null}
                {item.caption ? <span className="mt-0.5 block text-sm font-medium text-white">{item.caption}</span> : null}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

function PhotoGrid({ photos, limit, onOpen }: { photos: Item[]; limit: number; onOpen: (index: number) => void }) {
  return (
    <ul className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
      {photos.slice(0, limit).map((item, i) => (
        <li key={item.id} className="mb-3 break-inside-avoid sm:mb-4">
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Enlarge: ${item.label}`}
            className="group relative block w-full overflow-hidden rounded-lg bg-neutral-900"
          >
            <Image
              src={item.src}
              alt={item.label}
              width={item.width}
              height={item.height}
              placeholder={item.blur ? "blur" : "empty"}
              blurDataURL={item.blur}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="h-auto w-full transition duration-500 ease-out group-hover:scale-[1.04]"
            />
            {item.caption ? (
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-left text-sm font-medium text-white"
              >
                {item.caption}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Full-screen viewer: swipe, arrows, keyboard, and a "3 / 76" counter.

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: Item[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const many = items.length > 1;
  const prev = useCallback(() => onNavigate((index - 1 + items.length) % items.length), [index, items.length, onNavigate]);
  const next = useCallback(() => onNavigate((index + 1) % items.length), [index, items.length, onNavigate]);

  useEffect(() => {
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) prev();
      else if (e.key === "ArrowRight" && many) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [many, next, prev, onClose]);

  const control =
    "absolute z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-3xl leading-none text-white/90 transition hover:bg-black/75 hover:text-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black p-3 sm:p-6"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-4 pr-20 text-white">
        <p className="min-w-0 truncate text-[0.95rem]">
          <span className="text-[var(--accent-gold-bright)]">{item.category.name}</span>
          {item.caption ? <span className="text-white/80"> · {item.caption}</span> : null}
        </p>
        {many ? (
          <p className="shrink-0 font-mono text-sm tabular-nums text-white/75">
            {index + 1} / {items.length}
          </p>
        ) : null}
      </div>
      <button ref={closeRef} onClick={onClose} aria-label="Close" className={`${control} right-3 top-3`}>
        &times;
      </button>
      {many ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
            className={`${control} bottom-4 left-4 sm:bottom-auto sm:left-6`}
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
            className={`${control} bottom-4 right-4 sm:bottom-auto sm:right-6`}
          >
            &#8250;
          </button>
        </>
      ) : null}

      <div className="relative h-[78svh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {item.kind === "video" ? (
          <LightboxVideo key={item.id} src={item.src} poster={item.still} />
        ) : (
          <Image
            key={item.id}
            src={item.src}
            alt={item.label}
            fill
            sizes="100vw"
            placeholder={item.blur ? "blur" : "empty"}
            blurDataURL={item.blur}
            className="object-contain"
          />
        )}
      </div>
    </div>
  );
}

function LightboxVideo({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Start explicitly: the `autoplay` attribute alone races React setting
  // `muted`, and the visitor's tap that opened the viewer allows playback.
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    if (muted) video.play().catch(() => {});
    setMuted(!muted);
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
        className="absolute bottom-4 left-1/2 z-10 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-black/55 px-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
      >
        {muted ? <IconSpeakerOff className="h-4 w-4" /> : <IconSpeakerOn className="h-4 w-4" />}
        {muted ? "Tap for sound" : "Sound on"}
      </button>
    </>
  );
}
