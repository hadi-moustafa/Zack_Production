"use client";

import { useEffect, useRef, useState } from "react";
import { useSound } from "@/components/sound/SoundProvider";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  playSound = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Play a soft film-advance click when this reveal enters the viewport. Reserve for one per-section trigger. */
  playSound?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const sound = useSound();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (playSound) sound?.playReel();
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
