"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { photoPublicUrl, workAlt } from "@/lib/media";
import { byOrder } from "@/lib/categories";
import type { Category, Photo } from "@/lib/types";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";
import { IconPlay, IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

const PAGE_SIZE = 12;
const ALL = "all";

type Item = {
  id: string;
  kind: "photo" | "video";
  src: string;
  poster?: string;
  blur?: string;
  width: number;
  height: number;
  caption: string;
  category: Category;
  label: string;
};

function toItem(p: Photo, category: Category): Item {
  return {
    id: p.id,
    kind: p.media_type === "video" ? "video" : "photo",
    src: photoPublicUrl(p.storage_path),
    poster: p.poster_path ? photoPublicUrl(p.poster_path) : undefined,
    blur: p.blur_data ?? undefined,
    // Unknown sizes fall back to the most common shapes (4:5 photo, 9:16 film).
    width: p.width ?? (p.media_type === "video" ? 720 : 1600),
    height: p.height ?? (p.media_type === "video" ? 1280 : 2000),
    caption: p.caption.trim(),
    category,
    label: workAlt(category.name, p.media_type === "video" ? "video" : "photo", p.caption),
  };
}

export default function Work({ photos, categories }: { photos: Photo[]; categories: Category[] }) {
  // Starred items first, then admin order. Only items in a visible category show.
  const items = useMemo(() => {
    const byId = new Map(categories.filter((c) => c.visible).map((c) => [c.id, c]));
    return [...photos]
      .filter((p) => p.category_id && byId.has(p.category_id))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order)
      .map((p) => toItem(p, byId.get(p.category_id!)!));
  }, [photos, categories]);

  const chips = useMemo(
    () =>
      categories
        .filter((c) => c.visible && items.some((i) => i.category.id === c.id))
        .sort(byOrder)
        .map((c) => {
          const first = items.find((i) => i.category.id === c.id);
          const cover = c.cover_path ? photoPublicUrl(c.cover_path) : first?.kind === "video" ? first.poster : first?.src;
          return { category: c, cover };
        }),
    [categories, items]
  );

  const [active, setActive] = useState<string>(ALL);
  const [photoLimit, setPhotoLimit] = useState(PAGE_SIZE);
  const [open, setOpen] = useState<{ list: Item[]; index: number } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Deep links: ?work=weddings opens that category.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("work");
    if (slug && chips.some((c) => c.category.slug === slug)) {
      // One-time read of the URL after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(slug);
    }
  }, [chips]);

  function choose(slug: string) {
    setActive(slug);
    setPhotoLimit(PAGE_SIZE);
    const url = new URL(window.location.href);
    if (slug === ALL) url.searchParams.delete("work");
    else url.searchParams.set("work", slug);
    window.history.replaceState(null, "", url);
  }

  const visible = active === ALL ? items : items.filter((i) => i.category.slug === active);
  const films = visible.filter((i) => i.kind === "video");
  const stills = visible.filter((i) => i.kind === "photo");

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} id="gallery" className="relative bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal>
          <div className="section-index">
            <span className="num">I</span>
            <span className="line" />
            <span className="eyebrow">My work</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
            Selected Work
          </h2>
          <Flourish />
        </Reveal>

        {chips.length > 1 ? (
          <div
            role="group"
            aria-label="Filter work by category"
            className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <Chip label="All" pressed={active === ALL} onClick={() => choose(ALL)} />
            {chips.map(({ category, cover }) => (
              <Chip
                key={category.id}
                label={category.name}
                cover={cover}
                pressed={active === category.slug}
                onClick={() => choose(category.slug)}
              />
            ))}
          </div>
        ) : null}

        {films.length > 0 ? (
          <Films films={films} onOpen={(index) => setOpen({ list: films, index })} />
        ) : null}

        {stills.length > 0 ? (
          <div id="photos" className="mt-16 scroll-mt-28">
            <PartHeading title="Photos" count={stills.length} />
            <ul className="mt-6 columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
              {stills.slice(0, photoLimit).map((item, i) => (
                <li key={item.id} className="mb-3 break-inside-avoid sm:mb-4">
                  <button
                    type="button"
                    onClick={() => setOpen({ list: stills, index: i })}
                    aria-label={`Enlarge: ${item.label}`}
                    className="group relative block w-full overflow-hidden rounded-md bg-neutral-900"
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
            {stills.length > photoLimit ? (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setPhotoLimit((n) => n + PAGE_SIZE)} className="btn-ghost">
                  Show more photos ({stills.length - photoLimit})
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
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

function Chip({
  label,
  cover,
  pressed,
  onClick,
}: {
  label: string;
  cover?: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border py-1 pr-4 text-[0.95rem] font-medium transition ${
        cover ? "pl-1" : "pl-4"
      } ${
        pressed
          ? "border-[var(--accent-gold-bright)] bg-[var(--accent-gold)] text-[#0a0a0a]"
          : "border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]"
      }`}
    >
      {cover ? (
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-800">
          <Image src={cover} alt="" aria-hidden fill sizes="32px" className="object-cover" />
        </span>
      ) : null}
      {label}
    </button>
  );
}

function PartHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] pb-3">
      <h3 className="font-serif-display text-[clamp(1.75rem,6vw,2.5rem)] font-medium leading-none text-[var(--text-primary)]">
        {title}
      </h3>
      <span className="eyebrow">
        {count} {count === 1 ? title.replace(/s$/, "").toLowerCase() : title.toLowerCase()}
      </span>
    </div>
  );
}

// Films: the first (or starred) film large, the rest in a swipeable strip.
// Only still previews load here; a film streams once it's opened.
function Films({ films, onOpen }: { films: Item[]; onOpen: (index: number) => void }) {
  const [featured, ...rest] = films;
  const stripRef = useRef<HTMLUListElement>(null);
  const scroll = (dir: -1 | 1) =>
    stripRef.current?.scrollBy({ left: dir * stripRef.current.clientWidth * 0.8, behavior: "smooth" });
  const portrait = featured.height > featured.width;

  return (
    <div id="films" className="mt-12 scroll-mt-28">
      <PartHeading title="Films" count={films.length} />

      <div className="mt-6 grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-10">
        <FilmCard
          item={featured}
          onOpen={() => onOpen(0)}
          className={portrait ? "mx-auto h-[min(70svh,560px)] md:mx-0" : "w-full md:w-[38rem]"}
          sizes={portrait ? "(min-width: 768px) 320px, 80vw" : "(min-width: 768px) 608px, 100vw"}
          large
        />
        <div className="text-center md:text-left">
          <p className="eyebrow">{featured.category.name}</p>
          <p className="font-serif-display mt-3 text-[clamp(1.75rem,5vw,2.5rem)] italic leading-tight text-[var(--text-primary)]">
            {featured.caption || `${featured.category.name} film`}
          </p>
          <button type="button" onClick={() => onOpen(0)} className="btn-gold mt-6">
            <IconPlay aria-hidden className="h-4 w-4" /> Play film
          </button>
        </div>
      </div>

      {rest.length > 0 ? (
        <div className="relative mt-10">
          <ul
            ref={stripRef}
            className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin] sm:mx-0 sm:gap-4 sm:px-0"
          >
            {rest.map((item, i) => (
              <li key={item.id} className="snap-start">
                <FilmCard item={item} onOpen={() => onOpen(i + 1)} className="h-64 sm:h-80" sizes="240px" />
              </li>
            ))}
          </ul>
          {rest.length > 3 ? (
            <div className="mt-3 hidden justify-end gap-2 sm:flex">
              <StripButton label="Previous films" onClick={() => scroll(-1)}>
                ‹
              </StripButton>
              <StripButton label="Next films" onClick={() => scroll(1)}>
                ›
              </StripButton>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilmCard({
  item,
  onOpen,
  className,
  sizes,
  large = false,
}: {
  item: Item;
  onOpen: () => void;
  className: string;
  sizes: string;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play: ${item.label}`}
      style={{ aspectRatio: `${item.width} / ${item.height}` }}
      className={`group relative block overflow-hidden rounded-xl bg-neutral-900 ${className}`}
    >
      {item.poster ? (
        <Image
          src={item.poster}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          placeholder={item.blur ? "blur" : "empty"}
          blurDataURL={item.blur}
          className="object-cover transition duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <video
          aria-hidden
          src={`${item.src}#t=0.5`}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
      <span
        aria-hidden
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/45 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-[var(--accent-gold-bright)] group-hover:text-[var(--accent-gold-bright)] ${
          large ? "h-16 w-16" : "h-12 w-12"
        }`}
      >
        <IconPlay className={large ? "ml-1 h-7 w-7" : "ml-0.5 h-5 w-5"} />
      </span>
      {!large ? (
        <span aria-hidden className="absolute inset-x-3 bottom-3 text-left text-sm font-medium text-white">
          {item.caption || item.category.name}
        </span>
      ) : null}
    </button>
  );
}

function StripButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] text-2xl leading-none text-[var(--text-primary)] transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold-bright)]"
    >
      {children}
    </button>
  );
}

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
      aria-label={item.label}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <button ref={closeRef} onClick={onClose} aria-label="Close" className={`${control} right-3 top-3`}>
        &times;
      </button>
      {items.length > 1 ? (
        <>
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
        </>
      ) : null}

      <div className="relative h-[80svh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {item.kind === "video" ? (
          <LightboxVideo key={item.id} src={item.src} poster={item.poster} />
        ) : (
          <Image
            key={item.id}
            src={item.src}
            alt={item.label}
            fill
            sizes="90vw"
            placeholder={item.blur ? "blur" : "empty"}
            blurDataURL={item.blur}
            className="object-contain"
          />
        )}
      </div>

      {item.caption ? (
        <p className="absolute bottom-6 left-0 right-0 px-6 text-center text-white/85">{item.caption}</p>
      ) : null}
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
        className="absolute bottom-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
      >
        {muted ? <IconSpeakerOff className="h-4 w-4" /> : <IconSpeakerOn className="h-4 w-4" />}
      </button>
    </>
  );
}
