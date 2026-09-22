"use client";

import { useEffect, useState } from "react";
import SocialLinks from "@/components/SocialLinks";
import { IconMenu, IconClose } from "@/components/icons";
import type { SocialLink } from "@/lib/types";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "Who I Am" },
  { href: "#gallery", label: "Work" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({
  name,
  subtitle,
  socialLinks,
}: {
  name: string;
  subtitle: string;
  socialLinks: SocialLink[];
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "bg-[var(--bg-dark)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-10 sm:py-5">
        <a href="#home" className="leading-none">
          <span className="font-script block text-2xl text-[var(--accent-gold)] sm:text-3xl">{name}</span>
          <span className="eyebrow mt-0.5 block text-[0.6rem]">{subtitle}</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium tracking-wide text-[var(--text-primary)] transition hover:text-[var(--accent-gold)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--accent-gold)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <SocialLinks links={socialLinks.filter((l) => l.platform !== "twitter")} />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="text-[var(--text-primary)] lg:hidden"
        >
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      <nav
        className={`flex flex-col gap-1 overflow-hidden bg-[var(--bg-dark)]/95 px-5 backdrop-blur-md transition-[max-height,opacity,padding] duration-300 lg:hidden ${
          open ? "max-h-96 py-2 pb-6 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        {LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="border-b border-[var(--border-subtle)] py-3 text-base font-medium tracking-wide text-[var(--text-primary)] hover:text-[var(--accent-gold)]"
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            {link.label}
          </a>
        ))}
        <div className="pt-4">
          <SocialLinks links={socialLinks.filter((l) => l.platform !== "twitter")} />
        </div>
      </nav>
    </header>
  );
}
