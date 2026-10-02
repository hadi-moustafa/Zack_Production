import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { IconMail, IconPhone, IconPin, IconWhatsapp } from "@/components/icons";
import { site, locationLabel, responsePromise } from "@/lib/site";
import { telUrl, whatsappUrl } from "@/lib/contact";
import type { SiteData } from "@/lib/siteData";

const EXPLORE = [
  { href: "/#gallery", label: "Wedding, graduation & promo work" },
  { href: "/#about", label: "About Zack" },
  { href: "/#pricing", label: "Packages & pricing" },
  { href: "/#contact", label: "Book a shoot" },
  { href: "/privacy", label: "Privacy policy" },
];

const linkClass =
  "inline-flex min-h-11 items-center gap-2.5 text-[var(--text-secondary)] transition hover:text-[var(--accent-gold-bright)]";

export default function Footer({ logo, data }: { logo: React.ReactNode; data: SiteData }) {
  const { contact, socialLinks, content } = data;

  return (
    // Bottom padding on small screens keeps the last links clear of the sticky CTA bar.
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-dark)] pb-28 pt-14 lg:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Zack Production — home" className="inline-block">
            {logo}
          </Link>
          {content.footer_tagline ? (
            <p className="font-script mt-5 text-2xl text-[var(--text-primary)]">{content.footer_tagline}</p>
          ) : null}
          <p className="mt-3 max-w-xs text-[var(--text-secondary)]">
            Photography & film from {locationLabel}. {responsePromise}
          </p>
          <SocialLinks links={socialLinks} className="mt-6" />
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <ul className="mt-3">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Get in touch</p>
          <ul className="mt-3">
            {contact.whatsappDigits ? (
              <li>
                <a href={whatsappUrl(contact.whatsappDigits)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <IconWhatsapp className="h-4 w-4 text-[var(--accent-gold)]" /> Chat on WhatsApp
                </a>
              </li>
            ) : null}
            {contact.phone ? (
              <li>
                <a href={telUrl(contact.phone)} className={linkClass}>
                  <IconPhone className="h-4 w-4 text-[var(--accent-gold)]" /> {contact.phone}
                </a>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                  <IconMail className="h-4 w-4 shrink-0 text-[var(--accent-gold)]" /> {contact.email}
                </a>
              </li>
            ) : null}
            <li className="inline-flex min-h-11 items-center gap-2.5 text-[var(--text-secondary)]">
              <IconPin className="h-4 w-4 text-[var(--accent-gold)]" /> {locationLabel}
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-[var(--border-subtle)] px-5 pt-6 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p className="flex flex-wrap items-center gap-x-3">
          <span>
            Website by {site.credit.name} ·{" "}
            <a href={telUrl(site.credit.phone)} className="inline-flex min-h-11 items-center transition hover:text-[var(--accent-gold-bright)]">
              {site.credit.phone}
            </a>
          </span>
          <Link
            href="/admin/dashboard"
            rel="nofollow"
            className="inline-flex min-h-11 min-w-11 items-center justify-center transition hover:text-[var(--accent-gold-bright)]"
          >
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
