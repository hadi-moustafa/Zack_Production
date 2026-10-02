"use client";

import { useEffect, useState } from "react";
import { IconWhatsapp } from "@/components/icons";
import { LAST_WHATSAPP_URL_KEY } from "@/lib/contact";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Reopens the exact WhatsApp message from the form (if the popup was blocked
// or closed), falling back to a plain chat link. Also records the lead in
// analytics, when analytics is enabled.
export default function ThankYouActions({ fallbackUrl }: { fallbackUrl: string | null }) {
  const [url, setUrl] = useState(fallbackUrl);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LAST_WHATSAPP_URL_KEY);
      // One-time read of client-only storage after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved?.startsWith("https://wa.me/")) setUrl(saved);
    } catch {
      // Storage unavailable: keep the plain chat link.
    }
    window.gtag?.("event", "generate_lead", { method: "contact_form" });
  }, []);

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 font-semibold text-[#0a0a0a] transition hover:brightness-110"
    >
      <IconWhatsapp aria-hidden className="h-5 w-5" /> WhatsApp didn&apos;t open? Send it here
    </a>
  );
}
