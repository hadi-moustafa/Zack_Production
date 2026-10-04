"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowRight, IconWhatsapp } from "@/components/icons";
import { whatsappUrl } from "@/lib/contact";
import { usePlanSelection } from "@/lib/planSelection";

// Bottom booking bar for phones and tablets. On the home page it appears once
// the hero (and its own CTA) has scrolled away, and steps aside whenever the
// contact form itself is on screen.
export default function StickyCta({ whatsappDigits }: { whatsappDigits: string | null }) {
  const pathname = usePathname();
  // A design preview is the home page too.
  const isHome = pathname === "/" || pathname.startsWith("/preview/");
  const [pastHero, setPastHero] = useState(false);
  const [contactInView, setContactInView] = useState(false);
  const selectedCount = usePlanSelection().length;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const contact = document.getElementById("contact");
    const observer = contact
      ? new IntersectionObserver(([entry]) => setContactInView(entry.isIntersecting), { threshold: 0.15 })
      : null;
    if (contact && observer) observer.observe(contact);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [isHome]);

  if (pathname === "/thank-you") return null;
  const visible = isHome ? pastHero && !contactInView : true;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-dark)]/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <Link href={isHome ? "#contact" : "/#contact"} tabIndex={visible ? 0 : -1} className="btn-gold min-h-12 flex-1 justify-center">
          {selectedCount > 0 ? `Continue · ${selectedCount} selected` : "Book a shoot"}{" "}
          <IconArrowRight className="h-4 w-4" />
        </Link>
        {whatsappDigits ? (
          <a
            href={whatsappUrl(whatsappDigits)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={visible ? 0 : -1}
            aria-label="Chat with Zack Production on WhatsApp"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"
          >
            <IconWhatsapp className="h-6 w-6" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
