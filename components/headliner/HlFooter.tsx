import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { IconMail, IconPhone, IconPin, IconWhatsapp } from "@/components/icons";
import { site, locationLabel, responsePromise } from "@/lib/site";
import { telUrl, whatsappUrl } from "@/lib/contact";
import type { SiteData } from "@/lib/siteData";
import type { NavLink } from "@/components/headliner/HlNav";

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center gap-2.5 text-[var(--text-secondary)] transition hover:text-[var(--accent-gold-bright)]";

export default function HlFooter({ logo, data, links }: { logo: React.ReactNode; data: SiteData; links: NavLink[] }) {
  const { contact, socialLinks, content } = data;

  return (
    // Bottom padding on small screens keeps the last links clear of the sticky CTA bar.
    <footer className="relative overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-dark)] pb-28 pt-16 lg:pb-10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {content.footer_tagline ? (
          <p className="hl-em text-[clamp(2.5rem,11vw,6.5rem)] leading-[0.95]">{content.footer_tagline}</p>
        ) : null}

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="Zack Production — home" className="inline-block">
              {logo}
            </Link>
            <p className="mt-4 max-w-xs text-[var(--text-secondary)]">
              Photography &amp; film from {locationLabel}. {responsePromise}
            </p>
            <SocialLinks links={socialLinks} className="mt-6" />
          </div>

          <nav aria-label="Footer">
            <p className="hl-label">Explore</p>
            <ul className="mt-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy" className={linkClass}>
                  Privacy policy
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="hl-label">Get in touch</p>
            <ul className="mt-3">
              {contact.whatsappDigits ? (
                <li>
                  <a href={whatsappUrl(contact.whatsappDigits)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <IconWhatsapp aria-hidden className="h-4 w-4 text-[var(--hl-volt)]" /> Chat on WhatsApp
                  </a>
                </li>
              ) : null}
              {contact.phone ? (
                <li>
                  <a href={telUrl(contact.phone)} className={linkClass}>
                    <IconPhone aria-hidden className="h-4 w-4 text-[var(--hl-volt)]" /> {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                    <IconMail aria-hidden className="h-4 w-4 shrink-0 text-[var(--hl-volt)]" /> {contact.email}
                  </a>
                </li>
              ) : null}
              <li className="inline-flex min-h-11 min-w-11 items-center gap-2.5 text-[var(--text-secondary)]">
                <IconPin aria-hidden className="h-4 w-4 text-[var(--hl-volt)]" /> {locationLabel}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The name, edge to edge, in outline. */}
      <svg aria-hidden viewBox="0 0 1000 150" className="mt-14 block w-full text-[var(--text-primary)]/35">
        <text
          x="500"
          y="128"
          textAnchor="middle"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          className="hl-display"
          style={{ fontSize: 160 }}
          fill="var(--bg-dark)"
          stroke="currentColor"
          strokeWidth="2.4"
          paintOrder="stroke fill"
        >
          {site.name.toUpperCase()}
        </text>
      </svg>

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-2 border-t border-[var(--border-subtle)] px-5 pt-6 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p className="flex flex-wrap items-center gap-x-3">
          <span>
            Website by{" "}
            <a
              href={site.credit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline-offset-4 transition hover:text-[var(--accent-gold-bright)] hover:underline"
            >
              {site.credit.name}
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
