"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import { countLabel, type Group } from "@/lib/work";

// Selected work as an index: one row per category with its counts, each
// linking to its own page (/work/[slug]). On a desktop a thumbnail trails
// the pointer; on a phone each row carries a small one. The old in-page
// deep links (?work=slug&view=) forward to the category's page.
export default function EdWork({ groups, label = true }: { groups: Group[]; label?: boolean }) {
  const router = useRouter();
  const followRef = useRef<HTMLDivElement>(null);
  const followImg = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = groups.find((x) => x.category.slug === params.get("work"));
    if (!g) return;
    const view = params.get("view");
    router.replace(`/work/${g.category.slug}${view === "films" || view === "photos" ? `?view=${view}` : ""}`);
  }, [groups, router]);

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

  if (groups.length === 0) return null;

  return (
    <section id="gallery" aria-label={label ? undefined : "Categories"} className={`scroll-mt-16 ${label ? "ed-section border-t border-[var(--ed-line)]" : "pb-[var(--ed-section-y)] pt-12 sm:pt-16"}`}>
      <InView className="ed-wrap" threshold={0.05}>
        {label ? (
          <EdLabel as="h2" n={2}>
            Selected work
          </EdLabel>
        ) : null}

        <ul className={`ed-index border-t border-[var(--ed-line)] ${label ? "mt-12 sm:mt-16" : ""}`} onPointerLeave={() => hover(null)}>
          {groups.map((g, i) => (
            <li key={g.category.id} className="ed-reveal border-b border-[var(--ed-line)]" style={{ "--d": `${150 + i * 60}ms` } as React.CSSProperties}>
              <Link
                href={`/work/${g.category.slug}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && hover(g)}
                onClick={() => hover(null)}
                className="ed-index-row grid min-h-20 w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 py-5 sm:grid-cols-[4rem_1fr_auto] sm:py-7"
              >
                <span className="ed-label">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="ed-index-name ed-display block text-[clamp(2rem,6vw,5rem)] leading-none">{g.category.name}</span>
                  <span className="ed-label mt-2 block sm:hidden">{countLabel(g)}</span>
                </span>
                <span className="ed-label hidden text-right sm:block">{countLabel(g)} →</span>
                {g.cover?.still ? (
                  <span className="relative row-start-1 h-16 w-[3.2rem] shrink-0 overflow-hidden bg-[var(--ed-bg-alt)] [grid-column:3] sm:hidden">
                    <Image src={g.cover.still} alt="" aria-hidden fill sizes="52px" placeholder={g.cover.blur ? "blur" : "empty"} blurDataURL={g.cover.blur} className="object-cover" />
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </InView>

      <div ref={followRef} aria-hidden data-on="0" className="ed-follow ed-media hidden bg-[var(--ed-bg-alt)] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- swapped by hand on hover, no layout to reserve */}
        <img ref={followImg} alt="" className="h-full w-full object-cover" />
      </div>
    </section>
  );
}
