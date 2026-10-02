"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import SoundToggle from "@/components/sound/SoundToggle";
import { IconMenu, IconClose } from "@/components/icons";
import { SECTIONS } from "@/lib/site";
import type { SocialLink } from "@/lib/types";

export default function Nav({ logo, socialLinks }: { logo: React.ReactNode; socialLinks: SocialLink[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-[var(--border-subtle)] bg-[var(--bg-dark)]/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-10 sm:py-5">
        <Link href="/" aria-label="Zack Production — home" className="shrink-0 leading-none">
          {logo}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              className="relative flex min-h-11 items-center text-[0.95rem] font-medium tracking-wide text-[var(--text-primary)] transition hover:text-[var(--accent-gold-bright)] after:absolute after:bottom-2 after:left-0 after:h-px after:w-0 after:bg-[var(--accent-gold)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {s.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SocialLinks links={socialLinks} />
          <SoundToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <SoundToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-no-sound
            className="flex h-11 w-11 items-center justify-center text-[var(--text-primary)]"
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className="max-h-[calc(100svh-5rem)] overflow-y-auto bg-[var(--bg-dark)]/95 px-4 pb-6 backdrop-blur-md sm:px-10 lg:hidden"
      >
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`/#${s.id}`}
            onClick={() => setOpen(false)}
            className="flex min-h-12 items-center border-b border-[var(--border-subtle)] text-lg font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold-bright)]"
          >
            {s.label}
          </Link>
        ))}
        <SocialLinks links={socialLinks} className="mt-6" />
      </nav>
    </header>
  );
}
