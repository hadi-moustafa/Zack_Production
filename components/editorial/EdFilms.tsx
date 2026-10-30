"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/Work";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import { FilmTile } from "@/components/editorial/EdCategoryGallery";
import { IconPlay } from "@/components/icons";
import type { Item } from "@/lib/work";

type Block = { kind: "single"; at: number } | { kind: "pair"; at: [number, number] };

/** One film on its own, then two side by side, and so on. */
function rhythm(count: number): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < count) {
    blocks.push({ kind: "single", at: i++ });
    if (i + 1 < count) {
      blocks.push({ kind: "pair", at: [i, i + 1] });
      i += 2;
    }
  }
  return blocks;
}

const titleOf = (item: Item) => (item.caption ? `“${item.caption}”` : item.category.name);

/** A small caption under a film in a pair: its own title, or its category unless the film before says it already. */
function pairCaption(films: Item[], i: number) {
  if (films[i].caption) return titleOf(films[i]);
  return films[i - 1]?.category.id === films[i].category.id ? null : films[i].category.name;
}

// The highlight films in an editorial rhythm, alternating a single film
// beside its caption with a pair. Wide films run edge to edge; upright phone
// films keep their shape. On a desktop the single films play silently while
// on screen; any film opens the player with sound.
export default function EdFilms({ films }: { films: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (films.length === 0) return null;
  let singles = 0;

  return (
    <section aria-labelledby="ed-films" className="ed-section border-t border-[var(--ed-line)]">
      <InView className="ed-wrap">
        <div id="ed-films">
          <EdLabel as="h2">Featured films</EdLabel>
        </div>
      </InView>

      <div className="mt-12 space-y-24 sm:mt-16 sm:space-y-36">
        {rhythm(films.length).map((block) => {
          if (block.kind === "pair") {
            const flip = singles % 2 === 1;
            return (
              <InView key={block.at.join("-")} threshold={0.1} className={`ed-wrap grid grid-cols-2 gap-3 sm:gap-5 lg:w-2/3 ${flip ? "lg:mr-0 lg:ml-auto" : "lg:ml-0 lg:mr-auto"}`}>
                {block.at.map((i, k) => {
                  const text = pairCaption(films, i);
                  return (
                    <figure key={films[i].id} className="ed-reveal" style={{ "--d": `${k * 120}ms` } as React.CSSProperties}>
                      <FilmTile item={films[i]} onOpen={() => setOpen(i)} className="aspect-[4/5]" sizes="(min-width: 1024px) 30vw, 50vw" />
                      {text ? <figcaption className="ed-label mt-3">{text}</figcaption> : null}
                    </figure>
                  );
                })}
              </InView>
            );
          }

          const item = films[block.at];
          const flip = singles++ % 2 === 1;
          const wide = item.width > item.height;
          const caption = (
            <div className="ed-reveal flex flex-col items-start gap-4" style={{ "--d": "150ms" } as React.CSSProperties}>
              {item.caption ? <p className="ed-label">{item.category.name}</p> : null}
              <h3 className="ed-display text-[clamp(2rem,4vw,3.5rem)]">{titleOf(item)}</h3>
              {item.category.description ? <p className="ed-body">{item.category.description}</p> : null}
              <button type="button" onClick={() => setOpen(block.at)} className="ed-link">
                Watch the film →
              </button>
            </div>
          );

          if (wide) {
            return (
              <InView key={item.id} threshold={0.1}>
                <div className="ed-reveal">
                  <FilmPreview item={item} onOpen={() => setOpen(block.at)} className="h-[80svh] w-full" sizes="100vw" />
                </div>
                <div className="ed-wrap mt-8 lg:grid lg:grid-cols-12">
                  <div className="lg:col-span-5">{caption}</div>
                </div>
              </InView>
            );
          }

          return (
            <InView key={item.id} threshold={0.1} className="ed-wrap grid items-center gap-8 lg:grid-cols-12 lg:gap-8">
              <div className={`ed-reveal lg:col-span-4 ${flip ? "lg:col-start-8 lg:row-start-1" : "lg:col-start-2"}`}>
                <FilmPreview item={item} onOpen={() => setOpen(block.at)} className="aspect-[4/5] w-full lg:aspect-[9/16]" sizes="(min-width: 1024px) 34vw, 100vw" />
              </div>
              <div className={`lg:row-start-1 lg:col-span-4 ${flip ? "lg:col-start-2" : "lg:col-start-7"}`}>{caption}</div>
            </InView>
          );
        })}
      </div>

      {open !== null ? <Lightbox items={films} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} /> : null}
    </section>
  );
}

// A film that plays silently, muted and looping, only while it's on screen
// on a desktop (and never with reduced motion or data saver on). Its source
// is attached only once it first comes near, so nothing downloads early.
function FilmPreview({ item, onOpen, className, sizes }: { item: Item; onOpen: () => void; className: string; sizes: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Without a preview frame, show the film's own first moments instead.
  const [src, setSrc] = useState<string | undefined>(item.still ? undefined : `${item.src}#t=0.5`);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData || !window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSrc(item.src);
          video.play().catch(() => {});
        } else video.pause();
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [item.src]);

  // Once the source is attached, start (play() before that is a no-op).
  useEffect(() => {
    if (src === item.src) ref.current?.play().catch(() => {});
  }, [src, item.src]);

  return (
    <button type="button" onClick={onOpen} aria-label={`Play: ${item.label}`} className={`ed-media group relative block overflow-hidden bg-[var(--ed-night)] ${className}`}>
      <video
        ref={ref}
        aria-hidden
        src={src}
        muted
        loop
        playsInline
        preload={item.still ? "none" : "metadata"}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {item.still ? (
        <Image
          src={item.still}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          placeholder={item.blur ? "blur" : "empty"}
          blurDataURL={item.blur}
          className={`object-cover transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-100"}`}
        />
      ) : null}
      <span aria-hidden className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center border border-white/50 bg-black/30 text-white transition group-hover:bg-black/60">
        <IconPlay className="ml-0.5 h-4 w-4" />
      </span>
    </button>
  );
}
