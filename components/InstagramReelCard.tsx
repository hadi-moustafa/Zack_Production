"use client";

import { useEffect, useRef, useState } from "react";
import { IconInstagram, IconSpeakerOff, IconSpeakerOn } from "@/components/icons";
import type { InstagramReel } from "@/lib/instagram";

// The latest reel, framed like a phone-sized ad. Plays muted while on screen
// and pauses when scrolled away; the whole card links to the reel itself.
export default function InstagramReelCard({ reel }: { reel: InstagramReel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted) video.play().catch(() => {});
  }

  return (
    <div className="relative mx-auto w-full max-w-[18rem] rounded-[1.9rem] bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-[0_35px_80px_-30px_rgba(238,42,123,0.55)]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.8rem] bg-black">
        <video
          ref={videoRef}
          aria-hidden
          src={reel.videoUrl}
          poster={reel.posterUrl ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />

        <a
          href={reel.permalink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch the latest reel on Instagram"
          className="absolute inset-0 z-10"
        />

        <span className="pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
          <span className="rec-dot inline-block h-1.5 w-1.5 rounded-full bg-[#ee2a7b]" /> Latest reel
        </span>
        <button
          type="button"
          onClick={toggleMute}
          data-no-sound
          aria-label={muted ? "Unmute reel" : "Mute reel"}
          className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
        >
          {muted ? <IconSpeakerOff className="h-4 w-4" /> : <IconSpeakerOn className="h-4 w-4" />}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 p-4 text-white">
          <IconInstagram className="h-5 w-5 shrink-0" />
          <span className="truncate text-sm font-semibold">{reel.username ? `@${reel.username}` : "Instagram"}</span>
          <span className="ml-auto shrink-0 text-sm font-medium text-white/85">Watch ↗</span>
        </div>
      </div>
    </div>
  );
}
