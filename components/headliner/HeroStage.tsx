"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Drives the hero's fly-through: writes scroll progress through the hero
// (0 → 1) into the --p custom property, which the CSS turns into scale/fade.
export function HeroScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} id="home" aria-label="Introduction" className="hl-hero">
      {children}
    </section>
  );
}

const beirutTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Beirut",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** Live local time in Beirut, ticking every second (blank until hydrated). */
export function BeirutClock() {
  const time = useSyncExternalStore(
    subscribe,
    () => beirutTime.format(Math.floor(Date.now() / 1000) * 1000),
    () => "--:--:--"
  );
  return <span className="tabular-nums">{time}</span>;
}
