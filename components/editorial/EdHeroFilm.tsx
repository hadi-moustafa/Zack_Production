"use client";

import { useEffect, useRef, useState } from "react";
import { IconPause, IconPlay, IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

// The showreel: muted, looping, paused whenever it's off screen, with small
// pause and sound buttons. It never starts with sound, and reduced motion
// leaves it on its poster until someone presses play.
export default function EdHeroFilm({ mp4Src, webmSrc, poster }: { mp4Src?: string; webmSrc?: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // The visitor's own choice; scrolling away never overrides it.
  const wantsPlay = useRef(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) wantsPlay.current = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && wantsPlay.current) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.15 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    const video = ref.current;
    if (!video) return;
    wantsPlay.current = video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function toggleSound() {
    const video = ref.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && video.paused) {
      wantsPlay.current = true;
      video.play().catch(() => {});
    }
  }

  const button =
    "flex h-11 w-11 items-center justify-center border border-white/40 text-white transition hover:border-white hover:bg-white/10";

  return (
    <>
      <video
        ref={ref}
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
        {mp4Src ? <source src={mp4Src} type="video/mp4" /> : null}
      </video>
      <div className="absolute bottom-[calc(var(--ed-gutter)+env(safe-area-inset-bottom))] right-[var(--ed-gutter)] z-20 flex gap-2">
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause the showreel" : "Play the showreel"} className={button}>
          {playing ? <IconPause aria-hidden className="h-4 w-4" /> : <IconPlay aria-hidden className="h-4 w-4" />}
        </button>
        <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? "Turn the showreel's sound on" : "Mute the showreel"} className={button}>
          {muted ? <IconSpeakerOff aria-hidden className="h-4 w-4" /> : <IconSpeakerOn aria-hidden className="h-4 w-4" />}
        </button>
      </div>
    </>
  );
}
