"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialLinks from "@/components/SocialLinks";
import { useSound } from "@/components/sound/SoundProvider";
import { sfx } from "@/lib/sfx";
import type { SocialLink } from "@/lib/types";

export type NavLink = { href: string; label: string };

export default function HlNav({
  logo,
  links,
  socialLinks,
}: {
  logo: React.ReactNode;
  links: NavLink[];
  socialLinks: SocialLink[];
}) {
  const [open, setOpen] = useState(false);
  // In a design preview, stay on the preview rather than jumping to the live home page.
  const preview = usePathname().startsWith("/preview/");
  const href = (h: string) => (preview ? h.replace(/^\//, "") : h);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled && !open ? "bg-[var(--bg-dark)]/75 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="relative z-10 mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-8">
        <Link href="/" aria-label="Zack Production — home" className="flex min-h-11 items-center" onClick={() => setOpen(false)}>
          {logo}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={href(l.href)}
                  className="group relative inline-flex min-h-11 items-center px-3 font-mono text-[0.8rem] uppercase tracking-[0.18em] text-[var(--text-primary)]"
                >
                  {l.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-2 h-[2px] origin-right scale-x-0 bg-[var(--accent-gold)] transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SoundEq />
          <button
            type="button"
            data-sfx="whoosh"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="hl-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${
              open ? "bg-[var(--hl-ink)] text-white" : "bg-[var(--hl-volt)] text-[var(--hl-ink)]"
            }`}
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span className={`absolute left-0 h-[2px] w-5 bg-current transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-[2px] w-5 bg-current transition ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>
      </div>
    </header>

      <div
        id="hl-menu"
        data-open={open ? "1" : "0"}
        inert={!open}
        aria-hidden={!open}
        className="hl-menu fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-[var(--accent-gold)] px-5 pb-10 pt-28 text-[var(--hl-ink)] lg:hidden"
      >
        <nav aria-label="Menu">
          <ul>
            {links.map((l, i) => (
              <li key={l.href} className="overflow-hidden border-b border-[var(--hl-ink)]/25">
                <Link
                  href={href(l.href)}
                  onClick={() => setOpen(false)}
                  className="hl-menu-link flex min-h-16 items-baseline gap-4 py-2"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hl-display text-[clamp(3rem,17vw,5.5rem)]">{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-10">
          <SocialLinks links={socialLinks} />
        </div>
      </div>
    </>
  );
}

// The sound switch, drawn as an equaliser that dances while sound is on.
function SoundEq() {
  const sound = useSound();
  if (!sound) return null;
  return (
    <button
      type="button"
      data-sfx="none"
      onClick={() => {
        if (!sound.enabled) {
          sfx.setEnabled(true);
          sfx.unlock();
          sfx.select(true);
        }
        sound.toggle();
      }}
      aria-label={sound.enabled ? "Mute sound" : "Turn sound on"}
      aria-pressed={sound.enabled}
      className="flex h-11 items-center gap-2.5 rounded-full border border-white/25 px-3.5 text-[var(--text-primary)] transition hover:border-[var(--hl-volt)] hover:text-[var(--hl-volt)]"
    >
      <span aria-hidden data-on={sound.enabled ? "1" : "0"} className="hl-eq flex h-4 items-end gap-[3px]">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="hidden font-mono text-[0.72rem] uppercase tracking-[0.16em] sm:inline">
        {sound.enabled ? "Sound on" : "Sound off"}
      </span>
    </button>
  );
}
