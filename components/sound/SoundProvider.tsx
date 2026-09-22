"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  playReel: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const SHUTTER_SRC = "/sounds/shutter.mp3";
const REEL_SRC = "/sounds/reel.mp3";
const STORAGE_KEY = "zp-sound-enabled";
const POOL_SIZE = 4;

function createPool(src: string) {
  if (typeof Audio === "undefined") return [];
  return Array.from({ length: POOL_SIZE }, () => {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  });
}

export default function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const shutterPool = useRef<HTMLAudioElement[]>([]);
  const reelPool = useRef<HTMLAudioElement[]>([]);
  const shutterIndex = useRef(0);
  const reelIndex = useRef(0);

  useEffect(() => {
    shutterPool.current = createPool(SHUTTER_SRC);
    reelPool.current = createPool(REEL_SRC);

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // One-time sync from localStorage on mount, before paint would be ideal,
      // but this runs client-only so the server-rendered default never flashes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setEnabled(stored === "1");
    } catch {
      // localStorage unavailable (private mode, etc.) — keep default
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      // ignore
    }
  }, [enabled, hydrated]);

  // Unlock audio playback on the first user gesture (browser autoplay policy).
  useEffect(() => {
    const unlock = () => {
      [...shutterPool.current, ...reelPool.current].forEach((audio) => {
        audio
          .play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {});
      });
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  function playFromPool(pool: React.MutableRefObject<HTMLAudioElement[]>, index: React.MutableRefObject<number>) {
    if (!enabled || pool.current.length === 0) return;
    const audio = pool.current[index.current % pool.current.length];
    index.current += 1;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // Global click delegation: any button or link plays the shutter sound,
  // unless explicitly opted out with data-no-sound.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("button, a[href]");
      if (!el || el.closest("[data-no-sound]")) return;
      playFromPool(shutterPool, shutterIndex);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled,
      toggle: () => setEnabled((v) => !v),
      playReel: () => playFromPool(reelPool, reelIndex),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  return useContext(SoundContext);
}
