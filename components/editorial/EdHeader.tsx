"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BeirutClock from "@/components/BeirutClock";
import { SOCIAL_LABELS } from "@/lib/social";
import { site } from "@/lib/site";
import type { SocialLink } from "@/lib/types";

export type EdNavLink = { href: string; label: string; preview: string | null };

// Logo left; the Beirut clock and a Menu button right. Clear over the hero
// film, solid bone once past it; it slips away while scrolling down and
// returns on the way back up. Menu opens a full-screen numbered index.
export default function EdHeader({
  logo,
  links,
  socialLinks,
  contactLinks,
}: {
  logo: React.ReactNode;
  links: EdNavLink[];
  socialLinks: SocialLink[];
  contactLinks: { href: string; label: string; external?: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  // In a design preview, stay on the preview rather than jumping to the live home page.
  const pathname = usePathname();
  const preview = pathname.startsWith("/preview/");
  const href = (h: string) => (preview ? h.replace(/^\//, "") : h);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const hero = document.getElementById("home");
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - 80 : 0;
      setSolid(!hero || y > heroEnd);
      // Hide only after a real scroll down, past the first screen.
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > window.innerHeight * 0.6);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus({ preventScroll: true });
    const button = buttonRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      button?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        data-solid={solid || open ? "1" : "0"}
        data-hidden={hidden && !open ? "1" : "0"}
        className="ed-header fixed inset-x-0 top-0 z-50 border-b"
      >
        <div className="ed-wrap flex h-16 items-center justify-between gap-3 sm:h-20">
          <Link href="/" aria-label={`${site.name}, home`} className="flex min-h-11 shrink-0 items-center" onClick={close}>
            {logo}
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <p className="ed-label !text-current hidden min-[360px]:block">
              {site.location.city} <BeirutClock seconds={false} />
            </p>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="ed-menu"
              className="flex min-h-11 min-w-11 items-center justify-end gap-3 font-mono text-[0.8125rem] uppercase tracking-[0.12em]"
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span aria-hidden className="relative block h-2.5 w-6">
                <span className={`absolute left-0 h-px w-6 bg-current transition duration-300 ${open ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-6 bg-current transition duration-300 ${open ? "top-1 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="ed-menu"
        data-open={open ? "1" : "0"}
        inert={!open}
        aria-hidden={!open}
        className="ed-menu fixed inset-0 z-[45] overflow-y-auto bg-[var(--ed-bg)] text-[var(--ed-ink)]"
      >
        <div className="ed-wrap grid min-h-full grid-rows-[1fr_auto] gap-10 pb-10 pt-24 sm:pt-32 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <nav aria-label="Main">
            <ul className="border-t border-[var(--ed-line)]">
              {links.map((l, i) => (
                <li key={l.href} className="border-b border-[var(--ed-line)]">
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={href(l.href)}
                    onClick={close}
                    onPointerEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    className="group flex min-h-16 items-baseline gap-4 py-3 sm:gap-6"
                  >
                    <span className="ed-label w-10 shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
                    <span className="ed-display text-[clamp(2.5rem,9vw,5.5rem)] transition-transform duration-500 group-hover:translate-x-3">
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div aria-hidden className="ed-menu-preview relative hidden aspect-[4/5] max-h-[70vh] self-start overflow-hidden bg-[var(--ed-bg-alt)] lg:block">
            {links.map((l, i) =>
              l.preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- decorative, only fetched once the menu opens
                <img
                  key={l.href}
                  src={open ? l.preview : undefined}
                  alt=""
                  data-on={hovered === i ? "1" : "0"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null
            )}
          </div>

          <div className="grid gap-6 border-t border-[var(--ed-line)] pt-6 sm:grid-cols-2 lg:col-span-2">
            <ul className="flex flex-wrap gap-x-6">
              {contactLinks.map((c) => (
                <li key={c.href}>
                  <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ed-link">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-x-6 sm:justify-end">
              {socialLinks.map((s) => (
                <li key={s.platform}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="ed-link">
                    {SOCIAL_LABELS[s.platform] ?? s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
