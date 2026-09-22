"use client";

import { useEffect, useRef, useState } from "react";
import { IconSpeakerOff, IconSpeakerOn } from "@/components/icons";

export default function VideoTile({
  src,
  caption,
  className = "",
  onOpen,
}: {
  src: string;
  caption?: string;
  className?: string;
  onOpen: () => void;
}) {
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
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggleMute(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (!nextMuted) video.play().catch(() => {});
    setMuted(nextMuted);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-md bg-neutral-900 ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
        muted={muted}
        loop
        playsInline
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {caption ? (
        <span className="absolute bottom-2 left-2.5 max-w-[65%] text-left text-xs font-medium text-white">
          {caption}
        </span>
      ) : null}

      <button
        type="button"
        data-no-sound
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
        className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
      >
        {muted ? <IconSpeakerOff className="h-4 w-4" /> : <IconSpeakerOn className="h-4 w-4" />}
      </button>
    </div>
  );
}
