"use client";

import { useEffect, useRef } from "react";
import { useSound } from "@/components/sound/SoundProvider";

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
  const sound = useSound();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sound) return;
    return sound.registerVideo(video);
  }, [sound]);

  return (
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
  );
}
