"use client";

import { useState } from "react";
import SocialLinks from "@/components/SocialLinks";
import { IconMenu, IconClose } from "@/components/icons";
import type { SocialLink } from "@/lib/types";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#gallery", label: "Gallery" },
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

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <a href="#home" className="leading-none">
          <span className="font-script block text-3xl text-[var(--accent-gold)]">{name}</span>
          <span className="eyebrow mt-0.5 block text-[0.65rem]">{subtitle}</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-[var(--text-primary)] transition hover:text-[var(--accent-gold)]"
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

      {open ? (
        <nav className="flex flex-col gap-1 bg-[var(--bg-dark)]/95 px-6 pb-6 lg:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium tracking-wide text-[var(--text-primary)] hover:text-[var(--accent-gold)]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3">
            <SocialLinks links={socialLinks.filter((l) => l.platform !== "twitter")} />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
