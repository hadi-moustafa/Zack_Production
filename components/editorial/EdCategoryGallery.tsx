"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/Work";
import { IconPlay } from "@/components/icons";
import type { Group, Item } from "@/lib/work";

const PHOTO_PAGE = 18;
const FILM_PAGE = 12;

type View = "films" | "photos";

// One category's films and photos with a Films | Photos switch (?view=),
// paged, and any item opening full screen.
export default function EdCategoryGallery({ group }: { group: Group }) {
  const both = group.films.length > 0 && group.photos.length > 0;
  const [view, setView] = useState<View>(group.films.length ? "films" : "photos");
  const [limits, setLimits] = useState({ films: FILM_PAGE, photos: PHOTO_PAGE });
  const [open, setOpen] = useState<number | null>(null);
  const list = group[view];
  const limit = limits[view];

  // Deep links: ?view=photos
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    // One-time read of the URL after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if ((v === "photos" || v === "films") && group[v].length) setView(v);
  }, [group]);

  function choose(v: View) {
    setView(v);
    const url = new URL(window.location.href);
    url.searchParams.set("view", v);
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      {both ? (
        <div role="group" aria-label="Show films or photos" className="flex gap-6 border-b border-[var(--ed-line)] pb-2">
          {(["films", "photos"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => choose(v)} className="ed-link">
              {v === "films" ? "Films" : "Photos"} <span className="tabular-nums">{group[v].length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {view === "films" ? (
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {list.slice(0, limit).map((item, i) => (
            <li key={item.id}>
              <FilmTile item={item} onOpen={() => setOpen(i)} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-5 lg:columns-4">
          {list.slice(0, limit).map((item, i) => (
            <li key={item.id} className="mb-3 break-inside-avoid sm:mb-5">
              <button type="button" onClick={() => setOpen(i)} aria-label={`Enlarge: ${item.label}`} className="ed-media group relative block w-full overflow-hidden bg-[var(--ed-bg-alt)]">
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

      {open !== null ? <Lightbox items={list} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} /> : null}
    </div>
  );
}

/** A film's preview frame with a quiet play mark; opens the player. */
export function FilmTile({ item, onOpen, sizes, className = "aspect-[9/16]" }: { item: Item; onOpen: () => void; sizes: string; className?: string }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`Play: ${item.label}`} className={`ed-media group relative block w-full overflow-hidden bg-[var(--ed-night)] ${className}`}>
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
