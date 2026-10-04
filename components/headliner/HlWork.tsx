"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/Work";
import { IconArrowRight, IconClose, IconPlay } from "@/components/icons";
import InView from "@/components/headliner/InView";
import { Kicker, SplitWords } from "@/components/headliner/Kinetic";
import { buildGroups, countLabel, pickHighlights, type Group, type Item } from "@/lib/work";
import { sfx } from "@/lib/sfx";
import type { Category, Photo } from "@/lib/types";

const PHOTO_PAGE = 18;
const FILM_PAGE = 12;
const STRIP_HEIGHT = 280;

type View = "films" | "photos";

// Work, Headliner-style: a reel of highlight films, a giant type index of
// categories that opens each one full-screen, and two rivers of stills.
export default function HlWork({ photos, categories }: { photos: Photo[]; categories: Category[] }) {
  const groups = useMemo(() => buildGroups(photos, categories), [photos, categories]);
  const [active, setActive] = useState<{ slug: string; view: View } | null>(null);
  const [open, setOpen] = useState<{ list: Item[]; index: number } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const films = useMemo(() => pickHighlights(groups, "films", 10, 2), [groups]);
  const stills = useMemo(() => pickHighlights(groups, "photos", 16, 4), [groups]);

  const defaultView = (g: Group): View => (g.films.length ? "films" : "photos");

  const syncUrl = useCallback((next: { slug: string; view: View } | null) => {
    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set("work", next.slug);
      url.searchParams.set("view", next.view);
    } else {
      url.searchParams.delete("work");
      url.searchParams.delete("view");
    }
    window.history.replaceState(null, "", url);
  }, []);

  // Deep links: ?work=weddings&view=photos
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = groups.find((x) => x.category.slug === params.get("work"));
    if (!g) return;
    const v = params.get("view");
    // One-time read of the URL after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive({ slug: g.category.slug, view: v === "photos" && g.photos.length ? "photos" : v === "films" && g.films.length ? "films" : defaultView(g) });
  }, [groups]);

  function enter(g: Group, from: HTMLElement) {
    returnFocus.current = from;
    const next = { slug: g.category.slug, view: defaultView(g) };
    setActive(next);
    syncUrl(next);
  }

  function leave() {
    sfx.whoosh(false);
    setActive(null);
    syncUrl(null);
    returnFocus.current?.focus();
  }

  if (groups.length === 0) return null;
  const group = active ? groups.find((g) => g.category.slug === active.slug) : undefined;
  const openList = (list: Item[], index: number) => setOpen({ list, index });

  return (
    <section id="gallery" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <InView>
          <Kicker n="03">Our work</Kicker>
          <h2 className="hl-display mt-5 text-[clamp(3.4rem,16vw,10rem)]">
            <SplitWords text="The work" /> <span className="hl-em">speaks.</span>
            <span className="hl-wipe block hl-outline-text" style={{ "--d": "300ms" } as React.CSSProperties}>
              Loudly.
            </span>
          </h2>
        </InView>
      </div>

      {films.length ? <FilmReel films={films} onOpen={(i) => openList(films, i)} /> : null}

      <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
        <p className="hl-label">The index</p>
        <InView as="ul" className="mt-4 border-t border-[var(--border-subtle)]" threshold={0.05}>
          {groups.map((g, i) => (
            <li key={g.category.id} className="hl-rise border-b border-[var(--border-subtle)]" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <button
                type="button"
                data-sfx="whoosh"
                data-cursor="Open"
                onClick={(e) => enter(g, e.currentTarget)}
                className="hl-index-row group flex w-full items-center gap-3 py-4 text-left sm:gap-6"
              >
                <span className="w-7 shrink-0 font-mono text-sm text-[var(--accent-gold-bright)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="hl-index-name hl-display hl-outline-text block break-words text-[clamp(2.3rem,11vw,7rem)] transition-colors duration-300">
                    {g.category.name}
                  </span>
                  <span className="mt-1 block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {countLabel(g)}
                  </span>
                </span>
                {g.cover?.still ? (
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[4px] sm:h-24 sm:w-36">
                    <Image
                      src={g.cover.still}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(min-width: 640px) 144px, 48px"
                      placeholder={g.cover.blur ? "blur" : "empty"}
                      blurDataURL={g.cover.blur}
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />
                  </span>
                ) : null}
                <IconArrowRight aria-hidden className="hidden h-6 w-6 shrink-0 -rotate-45 text-[var(--accent-gold)] transition group-hover:rotate-0 sm:block" />
              </button>
            </li>
          ))}
        </InView>
      </div>

      {stills.length >= 4 ? <StillRivers stills={stills} onOpen={(i) => openList(stills, i)} /> : null}

      {group && active ? (
        <Takeover
          key={group.category.id}
          group={group}
          view={group[active.view].length ? active.view : defaultView(group)}
          onView={(view) => {
            const next = { slug: group.category.slug, view };
            setActive(next);
            syncUrl(next);
          }}
          onOpen={openList}
          onClose={leave}
          lightboxOpen={open !== null}
        />
      ) : null}

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
// Highlight films as a swipeable reel of vertical cards.

function FilmReel({ films, onOpen }: { films: Item[]; onOpen: (i: number) => void }) {
  const scroller = useRef<HTMLUListElement>(null);
  const nudge = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="mt-14">
      <div className="mx-auto flex max-w-7xl items-end justify-between px-5 sm:px-8">
        <p className="hl-label">Highlight films</p>
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous films" className="hl-btn-ghost !h-11 !w-11 !p-0">
            <IconArrowRight aria-hidden className="h-4 w-4 rotate-180" />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="More films" className="hl-btn-ghost !h-11 !w-11 !p-0">
            <IconArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul ref={scroller} className="hl-scroller mt-5 flex gap-4 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {films.map((item, i) => (
          <li key={item.id} className="w-[62vw] max-w-[300px] shrink-0 sm:w-[260px]">
            <FilmCard item={item} n={i + 1} onOpen={() => onOpen(i)} showCategory />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilmCard({ item, n, onOpen, showCategory = false }: { item: Item; n: number; onOpen: () => void; showCategory?: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play: ${item.label}`}
      data-cursor="Play"
      data-sfx="whoosh"
      className="hl-film group relative block aspect-[9/16] w-full overflow-hidden rounded-[10px] bg-neutral-900"
    >
      {item.still ? (
        <Image
          src={item.still}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 640px) 260px, 62vw"
          placeholder={item.blur ? "blur" : "empty"}
          blurDataURL={item.blur}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <video aria-hidden src={`${item.src}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
      <span aria-hidden className="hl-display absolute left-3 top-2 text-[3.5rem] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]">
        {String(n).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--hl-volt)] text-[var(--hl-ink)] transition duration-300 group-hover:scale-110"
      >
        <IconPlay className="ml-0.5 h-4 w-4" />
      </span>
      <span aria-hidden className="absolute inset-x-3 bottom-3 text-left">
        {showCategory ? (
          <span className="block font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent-gold-bright)]">{item.category.name}</span>
        ) : null}
        {item.caption ? <span className="mt-0.5 block text-sm font-medium text-white">{item.caption}</span> : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Two rows of stills drifting in opposite directions. Hovering pauses them;
// any photo opens full screen.

function StillRivers({ stills, onOpen }: { stills: Item[]; onOpen: (i: number) => void }) {
  const half = Math.ceil(stills.length / 2);
  const rows = [stills.slice(0, half), stills.slice(half)].map((row, r) => ({
    items: row.map((item, k) => ({ item, index: r * half + k })),
  }));

  return (
    <div className="mt-20 space-y-3 sm:space-y-4" aria-label="Highlight photos" role="group">
      <p className="hl-label mx-auto max-w-7xl px-5 sm:px-8">Stills</p>
      {rows.map((row, r) => {
        const width = row.items.reduce((w, { item }) => w + (STRIP_HEIGHT * item.width) / item.height + 16, 0);
        // Repeat short rows so one copy is wider than any screen; the loop needs two.
        const repeat = Math.max(1, Math.ceil(2400 / Math.max(width, 1)));
        const copy = Array.from({ length: repeat }, () => row.items).flat();
        return (
          <div key={r} className="hl-strip overflow-x-auto motion-safe:overflow-hidden">
            <div className="hl-tape-track gap-3 sm:gap-4" data-reverse={r ? "" : undefined} style={{ "--speed": `${copy.length * 6}s` } as React.CSSProperties}>
              {[0, 1].map((dup) => (
                <ul key={dup} aria-hidden={dup === 1 || undefined} className="flex shrink-0 gap-3 sm:gap-4">
                  {copy.map(({ item, index }, k) => (
                    <li key={k} className="h-[180px] shrink-0 sm:h-[280px]" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                      <button
                        type="button"
                        tabIndex={dup === 1 || k >= row.items.length ? -1 : undefined}
                        onClick={() => onOpen(index)}
                        aria-label={`Enlarge: ${item.label}`}
                        data-cursor="View"
                        data-sfx="shutter"
                        className="group relative block h-full w-full overflow-hidden rounded-[6px] bg-neutral-900"
                      >
                        <Image
                          src={item.src}
                          alt={dup === 1 || k >= row.items.length ? "" : item.label}
                          fill
                          sizes="(min-width: 640px) 420px, 280px"
                          placeholder={item.blur ? "blur" : "empty"}
                          blurDataURL={item.blur}
                          className="object-cover grayscale-[0.4] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// A category, full screen: its name huge, a Films | Photos switch, the grid.

function Takeover({
  group,
  view,
  onView,
  onOpen,
  onClose,
  lightboxOpen,
}: {
  group: Group;
  view: View;
  onView: (v: View) => void;
  onOpen: (list: Item[], index: number) => void;
  onClose: () => void;
  lightboxOpen: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [limits, setLimits] = useState({ films: FILM_PAGE, photos: PHOTO_PAGE });
  const list = group[view];
  const both = group.films.length > 0 && group.photos.length > 0;
  const limit = limits[view];

  useEffect(() => {
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    if (lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={group.category.name} className="hl-takeover fixed inset-0 z-[65] overflow-y-auto bg-[var(--bg-dark)]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-dark)]/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <button ref={closeRef} type="button" data-sfx="none" onClick={onClose} aria-label="Back to all work" className="hl-btn-ghost !w-11 shrink-0 !p-0 sm:!w-auto sm:!px-4">
          <IconArrowRight aria-hidden className="h-4 w-4 rotate-180" /> <span className="hidden sm:inline">All work</span>
        </button>
        {both ? (
          <div role="group" aria-label="Show films or photos" className="flex gap-1.5">
            {(["films", "photos"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => onView(v)} className="hl-btn-ghost !px-3.5 !tracking-[0.1em] sm:!px-4">
                {v === "films" ? "Films" : "Photos"} <span className="tabular-nums opacity-70">{group[v].length}</span>
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" data-sfx="none" onClick={onClose} aria-label="Close" className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--hl-volt)] text-[var(--hl-ink)] sm:flex">
          <IconClose aria-hidden className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-8">
        <p className="hl-label">{countLabel(group)}</p>
        <h3 className="hl-display mt-3 break-words text-[clamp(3.5rem,17vw,12rem)]">{group.category.name}</h3>
        {group.category.description ? <p className="mt-4 max-w-xl text-[1.1rem] text-[var(--text-secondary)]">{group.category.description}</p> : null}

        {view === "films" ? (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {list.slice(0, limit).map((item, i) => (
              <li key={item.id}>
                <FilmCard item={item} n={i + 1} onOpen={() => onOpen(list, i)} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
            {list.slice(0, limit).map((item, i) => (
              <li key={item.id} className="mb-3 break-inside-avoid sm:mb-4">
                <button
                  type="button"
                  onClick={() => onOpen(list, i)}
                  aria-label={`Enlarge: ${item.label}`}
                  data-cursor="View"
                  data-sfx="shutter"
                  className="group relative block w-full overflow-hidden rounded-[6px] bg-neutral-900"
                >
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={item.width}
                    height={item.height}
                    placeholder={item.blur ? "blur" : "empty"}
                    blurDataURL={item.blur}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="h-auto w-full transition duration-500 group-hover:scale-[1.04]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {list.length > limit ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="font-mono text-sm text-[var(--text-secondary)]">
              {limit} / {list.length}
            </p>
            <button
              type="button"
              onClick={() => setLimits((l) => ({ ...l, [view]: l[view] + (view === "films" ? FILM_PAGE : PHOTO_PAGE) }))}
              className="hl-btn"
            >
              Show more {view === "films" ? "films" : "photos"}
            </button>
          </div>
        ) : null}

        <div className="mt-14 flex justify-center border-t border-[var(--border-subtle)] pt-8">
          <button type="button" data-sfx="none" onClick={onClose} className="hl-btn-ghost">
            <IconArrowRight aria-hidden className="h-4 w-4 rotate-180" /> All work
          </button>
        </div>
      </div>
    </div>
  );
}
