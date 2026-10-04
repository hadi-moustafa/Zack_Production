"use client";

import { useEffect, useRef } from "react";
import { useSound } from "@/components/sound/SoundProvider";
import { sfx } from "@/lib/sfx";

const INTERACTIVE = "a[href], button, [role='button'], summary, label[for]";

// Site-wide Headliner effects: sound on every tap (and a tick on hover with a
// mouse), a custom cursor on desktop, and a scroll progress bar. Tag an
// element (or an ancestor) with data-sfx="shutter" | "whoosh" | "none" to
// change its sound, and data-cursor="Play" to label the cursor over it.
export default function HlFx() {
  const sound = useSound();
  const enabled = sound?.enabled ?? false;
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sfx.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    const unlock = () => sfx.unlock();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(INTERACTIVE);
      if (!el) return;
      const kind = el.closest<HTMLElement>("[data-sfx]")?.dataset.sfx;
      if (kind === "none") return;
      if (kind === "shutter") sfx.shutter();
      else if (kind === "whoosh") sfx.whoosh();
      else sfx.tap();
    };

    const fine = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    let hovered: Element | null = null;
    let frame = 0;
    let x = -100;
    let y = -100;
    const paint = () => {
      frame = 0;
      cursorRef.current?.style.setProperty("--cx", `${x}px`);
      cursorRef.current?.style.setProperty("--cy", `${y}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (!fine.matches || e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onOver = (e: PointerEvent) => {
      if (!fine.matches || e.pointerType !== "mouse") return;
      const target = e.target as HTMLElement | null;
      const el = target?.closest(INTERACTIVE) ?? null;
      const label = target?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.dataset.hover = el ? "1" : "0";
        cursor.dataset.label = label;
        if (labelRef.current) labelRef.current.textContent = label;
      }
      if (el && el !== hovered) sfx.tick();
      hovered = el;
    };

    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        barRef.current?.style.setProperty("transform", `scaleX(${max > 0 ? window.scrollY / max : 0})`);
      });
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    document.addEventListener("click", onClick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("click", onClick);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
    };
  }, []);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[var(--accent-gold)] via-[var(--hl-violet)] to-[var(--hl-volt)]"
        style={{ transform: "scaleX(0)" }}
      />
      <div ref={cursorRef} aria-hidden className="hl-cursor">
        <span ref={labelRef} />
      </div>
    </>
  );
}
