"use client";

import { useEffect, useState } from "react";

const SEEN_KEY = "ed-intro-seen";

// A 1.6-second count-in that ends on the name, once per visit. It runs on CSS
// alone (so it also clears itself without JavaScript); the inline script hides
// it before first paint for anyone who's already seen it, and reduced motion
// skips it entirely (app/editorial.css).
export default function EdIntro({ name }: { name: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked: the intro just plays again next time.
    }
    // Arriving through in-site navigation, where the inline script doesn't run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (seen) setDone(true);
    const id = window.setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <div id="ed-intro" suppressHydrationWarning className={`ed-intro ${done ? "is-done" : ""}`} onClick={() => setDone(true)}>
        <div aria-hidden className="relative flex h-40 w-full items-center justify-center">
          <span className="ed-intro-count ed-display text-[6rem]">3</span>
          <span className="ed-intro-count ed-display text-[6rem]">2</span>
          <span className="ed-intro-count ed-display text-[6rem]">1</span>
          <p className="ed-intro-name text-center">
            <span className="ed-display block text-[clamp(2.5rem,9vw,5rem)]">{name}</span>
            <span className="ed-label mt-3 block">(Photography &amp; Film.)</span>
          </p>
        </div>
        <button type="button" onClick={() => setDone(true)} className="ed-link absolute bottom-6 right-[var(--ed-gutter)]">
          Skip intro
        </button>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{sessionStorage.getItem("${SEEN_KEY}")&&document.getElementById("ed-intro").setAttribute("data-seen","")}catch(e){}`,
        }}
      />
    </>
  );
}
