"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sfx";

const SEEN_KEY = "hl-intro-seen";

// A three-second film-leader countdown that ends on the name, once per visit.
// It runs on CSS alone (so it also clears itself without JavaScript); the
// inline script hides it before first paint for anyone who's already seen it.
// Tapping skips it, and since that tap unlocks audio, it lands with a "braam".
export default function Intro({ name }: { name: string }) {
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked: the intro just plays again next time.
    }
    if (seen) {
      // Arriving through in-site navigation, where the inline script doesn't run.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      return;
    }
    // Beeps only sound if audio is already unlocked; usually it isn't yet.
    const ids = [0, 500, 1000].map((ms) => window.setTimeout(() => sfx.beep(), ms));
    ids.push(window.setTimeout(() => sfx.braam(), 1500));
    ids.push(window.setTimeout(() => setDone(true), 3300));
    timers.current = ids;
    return () => ids.forEach(clearTimeout);
  }, []);

  function skip() {
    if (done) return;
    timers.current.forEach(clearTimeout);
    sfx.unlock();
    sfx.braam();
    setDone(true);
  }

  return (
    <>
      {/* Any tap skips; the button below makes that reachable by keyboard too. */}
      <div id="hl-intro" data-sfx="none" suppressHydrationWarning className={`hl-intro ${done ? "is-done" : ""}`} onClick={skip}>
        <div aria-hidden className="hl-intro-ring" />
        <span aria-hidden className="hl-intro-count hl-display">3</span>
        <span aria-hidden className="hl-intro-count hl-display">2</span>
        <span aria-hidden className="hl-intro-count hl-display">1</span>
        <p aria-hidden className="hl-intro-name">
          <span className="hl-display block text-[clamp(5rem,30vw,16rem)]">{name}</span>
          <span className="hl-intro-sub hl-label mt-2 !text-[var(--text-primary)]">Production</span>
        </p>
        <div aria-hidden className="hl-intro-flash" />
        <button
          type="button"
          data-sfx="none"
          className="absolute bottom-6 right-5 min-h-11 rounded-full border border-white/30 px-5 font-mono text-[0.78rem] uppercase tracking-[0.18em] text-white"
        >
          Skip intro
        </button>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{sessionStorage.getItem("${SEEN_KEY}")&&document.getElementById("hl-intro").setAttribute("data-seen","")}catch(e){}`,
        }}
      />
    </>
  );
}
