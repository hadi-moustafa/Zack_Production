"use client";

import { useRef, useState } from "react";
import { IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

export default function HeroVideo({
  mp4Src,
  webmSrc,
  poster,
}: {
  mp4Src?: string;
  webmSrc?: string;
  poster?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const next = !soundOn;
    video.muted = !next;
    if (next) video.play().catch(() => {});
    setSoundOn(next);
  }

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
      >
        {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
        {mp4Src ? <source src={mp4Src} type="video/mp4" /> : null}
      </video>

      <button
        type="button"
        data-no-sound
        onClick={toggleSound}
        aria-label={soundOn ? "Mute video sound" : "Play video with sound"}
        aria-pressed={soundOn}
        className="absolute right-5 top-20 z-20 flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-primary)] backdrop-blur-md transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] sm:right-10 sm:top-24"
      >
        {soundOn ? <IconSpeakerOn className="h-4 w-4" /> : <IconSpeakerOff className="h-4 w-4" />}
        {soundOn ? "Sound on" : "Play with sound"}
      </button>
    </>
  );
}
