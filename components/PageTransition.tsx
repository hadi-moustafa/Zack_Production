"use client";

import { useEffect, useState } from "react";

// Set once the first page has mounted; later pages are arrivals by navigation.
let navigated = false;

// Wraps each page (app/(site)/template.tsx remounts it on every navigation)
// so pages after the first fade in. The first page paints at once, so the
// hero is never held back.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => navigated);

  useEffect(() => {
    navigated = true;
  }, []);

  return <div className={`flex flex-1 flex-col ${animate ? "page-enter" : ""}`}>{children}</div>;
}
