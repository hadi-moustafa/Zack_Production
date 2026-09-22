"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  /** Hero (or any) video whose audio should follow the global sound toggle. */
  registerVideo: (el: HTMLVideoElement) => () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const SHUTTER_SRC = "/sounds/shutter.mp3";
const STORAGE_KEY = "zp-sound-enabled-v2";
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
  const shutterIndex = useRef(0);
  const videoEls = useRef<Set<HTMLVideoElement>>(new Set());
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    shutterPool.current = createPool(SHUTTER_SRC);

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // One-time sync from localStorage on mount — this runs client-only so
      // the server-rendered default never flashes.
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

  // Unlock audio playback on the first user gesture (browser autoplay policy),
  // and — if sound is on by preference — bring any registered video's audio
  // in at the same time.
  useEffect(() => {
    const unlock = () => {
      shutterPool.current.forEach((audio) => {
        audio
          .play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
          })
          .catch(() => {});
      });
      if (enabledRef.current) {
        videoEls.current.forEach((video) => {
          video.muted = false;
          video.play().catch(() => {});
        });
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  function playShutter() {
    if (!enabled || shutterPool.current.length === 0) return;
    const audio = shutterPool.current[shutterIndex.current % shutterPool.current.length];
    shutterIndex.current += 1;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // Global click delegation: any button or link plays the shutter sound,
  // unless explicitly opted out with data-no-sound. Skipped entirely on the
  // admin dashboard, where rapid clicking through forms made it grating.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname.startsWith("/admin")) return;
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("button, a[href]");
      if (!el || el.closest("[data-no-sound]")) return;
      playShutter();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled,
      toggle: () => {
        setEnabled((prev) => {
          const next = !prev;
          videoEls.current.forEach((video) => {
            video.muted = !next;
            if (next) video.play().catch(() => {});
          });
          return next;
        });
      },
      registerVideo: (el: HTMLVideoElement) => {
        videoEls.current.add(el);
        return () => {
          videoEls.current.delete(el);
        };
      },
    }),
    [enabled]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  return useContext(SoundContext);
}
