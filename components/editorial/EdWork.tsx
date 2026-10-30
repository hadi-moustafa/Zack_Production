"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/Work";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import { IconPlay } from "@/components/icons";
import { countLabel, type Group, type Item } from "@/lib/work";

const PHOTO_PAGE = 18;
const FILM_PAGE = 12;

type View = "films" | "photos";

const defaultView = (g: Group): View => (g.films.length ? "films" : "photos");
const desktop = () => window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

// Selected work as an index: one row per category with its counts. On a
// desktop a thumbnail trails the pointer and a click opens the category; on
// a phone a tap opens the row in place first. ?work=slug&view= deep-links.
export default function EdWork({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState<{ slug: string; view: View } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState<{ list: Item[]; index: number } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const followRef = useRef<HTMLDivElement>(null);
  const followImg = useRef<HTMLImageElement>(null);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = groups.find((x) => x.category.slug === params.get("work"));
    if (!g) return;
    const v = params.get("view");
    // One-time read of the URL after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive({ slug: g.category.slug, view: v === "photos" && g.photos.length ? "photos" : v === "films" && g.films.length ? "films" : defaultView(g) });
  }, [groups]);

  // The trailing thumbnail eases toward the pointer (a 120ms-ish lerp).
  useEffect(() => {
    const el = followRef.current;
    if (!el || !window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = -999,
      y = -999,
      cx = -999,
      cy = -999,
      frame = 0;
    const tick = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.setProperty("--fx", `${cx}px`);
      el.style.setProperty("--fy", `${cy}px`);
      frame = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (cx === -999) {
        cx = e.clientX;
        cy = e.clientY;
      }
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  function hover(g: Group | null) {
    const el = followRef.current;
    if (!el) return;
    if (g?.cover?.still && followImg.current) {
      followImg.current.src = g.cover.still;
      el.dataset.on = "1";
    } else el.dataset.on = "0";
  }

  function enter(g: Group, from: HTMLElement) {
    returnFocus.current = from;
    hover(null);
    const next = { slug: g.category.slug, view: defaultView(g) };
    setActive(next);
    syncUrl(next);
  }

  const leave = useCallback(() => {
    setActive(null);
    syncUrl(null);
    returnFocus.current?.focus({ preventScroll: true });
  }, [syncUrl]);

  if (groups.length === 0) return null;
  const group = active ? groups.find((g) => g.category.slug === active.slug) : undefined;

  return (
    <section id="gallery" className="ed-section scroll-mt-16 border-t border-[var(--ed-line)]">
      <InView className="ed-wrap" threshold={0.05}>
        <EdLabel as="h2" n={2} after={<span className="hidden sm:inline">[{groups.map((g) => g.category.name).join(" — ")}]</span>}>
          Selected work
        </EdLabel>

        <ul className="ed-index mt-12 border-t border-[var(--ed-line)] sm:mt-16" onPointerLeave={() => hover(null)}>
          {groups.map((g, i) => {
            const isOpen = expanded === g.category.id;
            return (
              <li key={g.category.id} className="ed-reveal border-b border-[var(--ed-line)]" style={{ "--d": `${150 + i * 60}ms` } as React.CSSProperties}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover(g)}
                  onClick={(e) => (desktop() ? enter(g, e.currentTarget) : setExpanded(isOpen ? null : g.category.id))}
                  className="ed-index-row grid min-h-20 w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 py-5 text-left sm:grid-cols-[4rem_1fr_auto] sm:py-7"
                >
                  <span className="ed-label">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ed-index-name ed-display block text-[clamp(2rem,6vw,5rem)] leading-none">{g.category.name}</span>
                  <span className="ed-label hidden text-right sm:block">{countLabel(g)}</span>
                  <span className="ed-label col-start-2 mt-2 sm:hidden">{countLabel(g)}</span>
                </button>

                {isOpen ? (
                  <div className="grid gap-5 pb-8 sm:grid-cols-[4rem_minmax(0,22rem)_1fr] sm:gap-x-3 lg:hidden">
                    {g.cover?.still ? (
                      <div className="relative aspect-[4/5] w-full max-w-xs bg-[var(--ed-bg-alt)] sm:col-start-2">
                        <Image src={g.cover.still} alt="" aria-hidden fill sizes="(min-width: 640px) 352px, 90vw" placeholder={g.cover.blur ? "blur" : "empty"} blurDataURL={g.cover.blur} className="object-cover" />
                      </div>
                    ) : null}
                    <div className="flex flex-col items-start justify-end gap-2 sm:col-start-3">
                      {g.category.description ? <p className="ed-body">{g.category.description}</p> : null}
                      <button type="button" onClick={(e) => enter(g, e.currentTarget)} className="ed-link">
                        View {g.category.name} →
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </InView>

      <div ref={followRef} aria-hidden data-on="0" className="ed-follow hidden bg-[var(--ed-bg-alt)] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- swapped by hand on hover, no layout to reserve */}
        <img ref={followImg} alt="" className="h-full w-full object-cover" />
      </div>

      {group && active ? (
        <CategoryView
          key={group.category.id}
          group={group}
          view={group[active.view].length ? active.view : defaultView(group)}
          onView={(view) => {
            const next = { slug: group.category.slug, view };
            setActive(next);
            syncUrl(next);
          }}
          onOpen={(list, index) => setOpen({ list, index })}
          onClose={leave}
          lightboxOpen={open !== null}
        />
      ) : null}

      {open ? (
        <Lightbox items={open.list} index={open.index} onClose={() => setOpen(null)} onNavigate={(index) => setOpen((o) => (o ? { ...o, index } : o))} />
      ) : null}
    </section>
  );
}

// One category, full screen on the bone page: its name, a Films | Photos
// switch, and the grid.
function CategoryView({
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
    closeRef.current?.focus({ preventScroll: true });
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
    <div role="dialog" aria-modal="true" aria-label={group.category.name} className="fixed inset-0 z-[65] overflow-y-auto bg-[var(--ed-bg)] text-[var(--ed-ink)]">
      <div className="sticky top-0 z-10 border-b border-[var(--ed-line)] bg-[var(--ed-bg)]">
        <div className="ed-wrap flex h-16 items-center justify-between gap-4 sm:h-20">
          <button ref={closeRef} type="button" onClick={onClose} className="ed-link">
            ← All work
          </button>
          {both ? (
            <div role="group" aria-label="Show films or photos" className="flex gap-5">
              {(["films", "photos"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => onView(v)}
                  className="ed-link"
                >
                  {v === "films" ? "Films" : "Photos"} <span className="tabular-nums">{group[v].length}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ed-wrap pb-24 pt-10 sm:pt-16">
        <p className="ed-label">({countLabel(group)}.)</p>
        <h3 className="ed-display ed-h1 mt-4 break-words">{group.category.name}</h3>
        {group.category.description ? <p className="ed-lead mt-5 max-w-xl">{group.category.description}</p> : null}

        {view === "films" ? (
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {list.slice(0, limit).map((item, i) => (
              <li key={item.id}>
                <FilmTile item={item} onOpen={() => onOpen(list, i)} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-12 columns-2 gap-3 sm:columns-3 sm:gap-5 lg:columns-4">
            {list.slice(0, limit).map((item, i) => (
              <li key={item.id} className="mb-3 break-inside-avoid sm:mb-5">
                <button type="button" onClick={() => onOpen(list, i)} aria-label={`Enlarge: ${item.label}`} className="group block w-full overflow-hidden bg-[var(--ed-bg-alt)]">
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={item.width}
                    height={item.height}
                    placeholder={item.blur ? "blur" : "empty"}
                    blurDataURL={item.blur}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {list.length > limit ? (
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="ed-label tabular-nums">
              {limit} / {list.length}
            </p>
            <button
              type="button"
              onClick={() => setLimits((l) => ({ ...l, [view]: l[view] + (view === "films" ? FILM_PAGE : PHOTO_PAGE) }))}
              className="ed-btn"
            >
              Show more {view === "films" ? "films" : "photos"}
            </button>
          </div>
        ) : null}

        <div className="mt-16 flex justify-center border-t border-[var(--ed-line)] pt-8">
          <button type="button" onClick={onClose} className="ed-link">
            ← All work
          </button>
        </div>
      </div>
    </div>
  );
}

/** A film's preview frame with a quiet play mark; opens the player. */
export function FilmTile({ item, onOpen, sizes, className = "aspect-[9/16]" }: { item: Item; onOpen: () => void; sizes: string; className?: string }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`Play: ${item.label}`} className={`group relative block w-full overflow-hidden bg-[var(--ed-night)] ${className}`}>
      {item.still ? (
        <Image
          src={item.still}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          placeholder={item.blur ? "blur" : "empty"}
          blurDataURL={item.blur}
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <video aria-hidden src={`${item.src}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <span aria-hidden className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center border border-white/50 bg-black/30 text-white transition group-hover:bg-black/60">
        <IconPlay className="ml-0.5 h-4 w-4" />
      </span>
    </button>
  );
}
