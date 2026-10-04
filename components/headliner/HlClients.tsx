"use client";

import { useRef } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/media";
import InView from "@/components/headliner/InView";
import { Kicker, SplitWords } from "@/components/headliner/Kinetic";
import type { Client } from "@/lib/types";

// Brands and well-known people we've worked with, all entered in Admin →
// Clients. Renders nothing until there's at least one.
export default function HlClients({ clients }: { clients: Client[] }) {
  const brands = clients.filter((c) => c.kind === "brand");
  const people = clients.filter((c) => c.kind === "person");
  if (brands.length + people.length === 0) return null;

  return (
    <section id="clients" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <InView>
          <Kicker n="03">The guest list</Kicker>
          <h2 className="hl-display mt-5 text-[clamp(3rem,13vw,8.5rem)]">
            <SplitWords text="They don't hire" /> <span className="hl-em">just anyone.</span>
          </h2>
          <p className="hl-rise mt-5 max-w-lg text-[1.05rem] text-[var(--text-secondary)]" style={{ "--d": "250ms" } as React.CSSProperties}>
            The brands and names who trusted us with their moment.
          </p>
        </InView>
      </div>

      {brands.length ? <BrandWall brands={brands} /> : null}
      {people.length ? <AList people={people} /> : null}
    </section>
  );
}

function Wrap({ client, className, children }: { client: Client; className: string; children: React.ReactNode }) {
  return client.url ? (
    <a href={client.url} target="_blank" rel="noopener noreferrer" className={className} data-cursor="Visit">
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

function BrandWall({ brands }: { brands: Client[] }) {
  return (
    <div className="mt-14">
      {brands.length >= 3 ? (
        <div aria-hidden className="hl-strip overflow-hidden border-y border-[var(--border-subtle)] py-4">
          <div className="hl-tape-track" style={{ "--speed": `${Math.max(20, brands.length * 5)}s` } as React.CSSProperties}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0">
                {Array.from({ length: Math.ceil(8 / brands.length) }, () => brands)
                  .flat()
                  .map((b, i) => (
                    <span key={i} className="hl-display hl-outline-text whitespace-nowrap px-6 text-[clamp(2.5rem,9vw,5rem)]">
                      {b.name} <span className="text-[var(--accent-gold)] [-webkit-text-stroke:0]">✦</span>
                    </span>
                  ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <InView as="ul" className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-px bg-[var(--border-subtle)] px-0 sm:grid-cols-3 lg:grid-cols-5" threshold={0.1}>
        {brands.map((b, i) => (
          <li key={b.id} className="hl-rise bg-[var(--bg-dark)]" style={{ "--d": `${(i % 10) * 60}ms` } as React.CSSProperties}>
            <Wrap
              client={b}
              className="group flex aspect-[3/2] flex-col items-center justify-center gap-2 p-5 text-center transition hover:bg-white/[0.04]"
            >
              {b.image_path ? (
                <span className="relative block h-full max-h-20 w-full">
                  <Image
                    src={photoPublicUrl(b.image_path)}
                    alt={`${b.name} logo`}
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
                    className={`object-contain opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100 ${b.logo_mono ? "hl-logo-mono" : ""}`}
                  />
                </span>
              ) : (
                <span className="hl-display text-[clamp(1.5rem,5vw,2.25rem)] transition group-hover:text-[var(--accent-gold)]">{b.name}</span>
              )}
              {b.role ? <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--text-secondary)]">{b.role}</span> : null}
            </Wrap>
          </li>
        ))}
      </InView>
    </div>
  );
}

// Well-known people as a big type list. Each row shows a thumbnail; on a
// desktop the photo also floats after the pointer.
function AList({ people }: { people: Client[] }) {
  const followRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function show(person: Client | null) {
    const el = followRef.current;
    if (!el) return;
    if (person?.image_path && imgRef.current) {
      imgRef.current.src = photoPublicUrl(person.image_path);
      el.dataset.on = "1";
    } else {
      el.dataset.on = "0";
    }
  }

  function move(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !followRef.current) return;
    followRef.current.style.left = `${e.clientX}px`;
    followRef.current.style.top = `${e.clientY}px`;
  }

  return (
    <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
      <p className="hl-label">The A-list</p>
      <InView as="ul" className="mt-4 border-t border-[var(--border-subtle)]" threshold={0.05}>
        {people.map((p, i) => (
          <li
            key={p.id}
            className="hl-rise border-b border-[var(--border-subtle)]"
            style={{ "--d": `${(i % 12) * 50}ms` } as React.CSSProperties}
            onPointerEnter={(e) => e.pointerType === "mouse" && show(p)}
            onPointerLeave={() => show(null)}
            onPointerMove={move}
          >
            <Wrap client={p} className="hl-person group flex min-h-20 items-center gap-4 py-3 sm:gap-6">
              <span className="w-8 shrink-0 font-mono text-sm text-[var(--accent-gold-bright)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="hl-person-name hl-display hl-outline-text hl-glitch block break-words text-[clamp(2.2rem,10vw,6rem)] transition-colors duration-300">
                  {p.name}
                </span>
                {p.role ? (
                  <span className="mt-1 block font-mono text-[0.78rem] uppercase tracking-[0.16em] text-[var(--text-secondary)]">{p.role}</span>
                ) : null}
              </span>
              {p.image_path ? (
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20">
                  <Image
                    src={photoPublicUrl(p.image_path)}
                    alt={p.name}
                    fill
                    sizes="80px"
                    className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                  />
                </span>
              ) : null}
            </Wrap>
          </li>
        ))}
      </InView>
      <div ref={followRef} aria-hidden data-on="0" className="hl-follow hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- swapped by hand on hover, no layout to reserve */}
        <img ref={imgRef} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
