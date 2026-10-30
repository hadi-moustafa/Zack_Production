"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/Work";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import type { Item } from "@/lib/work";

// The highlight stills, one at a time and whole (never cropped), on night.
// Arrows, ←/→ keys and a swipe move through them; only the current one and
// its two neighbours are loaded. "Show thumbnails" swaps in the full grid.
export default function EdStills({ stills }: { stills: Item[] }) {
  const [index, setIndex] = useState(0);
  const [grid, setGrid] = useState(false);
  const [full, setFull] = useState(false);
  const touchX = useRef<number | null>(null);
  const total = stills.length;
  const go = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  if (total === 0) return null;
  const item = stills[index];
  const near = new Set([index, (index + 1) % total, (index - 1 + total) % total]);

  function onKey(e: React.KeyboardEvent) {
    // The full-screen viewer handles its own keys.
    if (full) return;
    if (e.target instanceof HTMLElement && e.target.closest("[data-thumbs]")) return;
    if (e.key === "ArrowLeft") go(index - 1);
    else if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "Escape" && grid) setGrid(false);
    else return;
    e.preventDefault();
  }

  const control = "flex h-11 min-w-11 items-center justify-center px-2 text-[1.5rem] leading-none text-[var(--ed-night-ink)] transition hover:opacity-70";

  return (
    <section
      id="stills"
      aria-roledescription="carousel"
      aria-labelledby="ed-stills"
      tabIndex={-1}
      onKeyDown={onKey}
      className="ed-night relative flex min-h-[100svh] flex-col py-16 outline-none sm:py-20"
    >
      <InView className="ed-wrap flex items-baseline justify-between gap-4">
        <div id="ed-stills">
          <EdLabel as="h2">Stills</EdLabel>
        </div>
        <button type="button" onClick={() => setGrid((g) => !g)} aria-expanded={grid} aria-controls="ed-stills-stage" className="ed-link !text-[var(--ed-night-ink)]">
          {grid ? "Hide thumbnails" : "Show thumbnails"}
        </button>
      </InView>

      <div id="ed-stills-stage" className="ed-wrap mt-8 flex flex-1 flex-col">
        {grid ? (
          <ul data-thumbs className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {stills.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setGrid(false);
                  }}
                  aria-label={`Show still ${i + 1} of ${total}`}
                  aria-current={i === index || undefined}
                  className={`relative block aspect-square w-full overflow-hidden transition ${i === index ? "ring-1 ring-[var(--ed-night-ink)] ring-offset-2 ring-offset-[var(--ed-night)]" : "opacity-70 hover:opacity-100"}`}
                >
                  <Image src={s.src} alt="" aria-hidden fill sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 33vw" placeholder={s.blur ? "blur" : "empty"} blurDataURL={s.blur} className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="relative min-h-[60svh] flex-1"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) go(dx > 0 ? index - 1 : index + 1);
            }}
          >
            {stills.map((s, i) =>
              near.has(i) ? (
                <button
                  key={s.id}
                  type="button"
                  tabIndex={i === index ? 0 : -1}
                  aria-hidden={i !== index}
                  onClick={() => setFull(true)}
                  aria-label={`View full screen: ${s.label}`}
                  data-on={i === index ? "1" : "0"}
                  className={`ed-still absolute inset-0 ${i === index ? "" : "pointer-events-none"}`}
                >
                  <Image
                    src={s.src}
                    alt={i === index ? s.label : ""}
                    fill
                    sizes="(min-width: 1024px) 80vw, 100vw"
                    placeholder={s.blur ? "blur" : "empty"}
                    blurDataURL={s.blur}
                    className="object-contain"
                  />
                </button>
              ) : null
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--ed-night-line)] pt-4">
          <p className="ed-label min-w-0 truncate">({item.category.name}.)</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous still" className={control}>
              ‹
            </button>
            <p aria-live="polite" className="ed-label ed-label-ink min-w-[5.5rem] text-center tabular-nums">
              {index + 1} / {total}
            </p>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next still" className={control}>
              ›
            </button>
          </div>
        </div>
      </div>

      {full ? <Lightbox items={stills} index={index} onClose={() => setFull(false)} onNavigate={go} /> : null}
    </section>
  );
}
