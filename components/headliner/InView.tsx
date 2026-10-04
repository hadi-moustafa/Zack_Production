"use client";

import { useEffect, useRef } from "react";

// Marks its element with data-inview="1" the first time it scrolls into view;
// the .hl-rise / .hl-slam / .hl-wipe / .hl-words styles do the animating. Set
// straight on the DOM node, so it never re-renders anything.
export default function InView({
  children,
  className = "",
  style,
  threshold = 0.2,
  as: Tag = "div",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  as?: "div" | "section" | "header" | "ul" | "li";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.inview = "1";
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref as React.Ref<never>} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}
