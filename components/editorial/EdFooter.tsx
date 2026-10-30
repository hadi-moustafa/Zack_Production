import Link from "next/link";
import { SOCIAL_LABELS } from "@/lib/social";
import { site, locationLabel } from "@/lib/site";
import { telUrl, whatsappUrl } from "@/lib/contact";
import type { SiteData } from "@/lib/siteData";
import type { EdNavLink } from "@/components/editorial/EdHeader";

const linkClass = "inline-flex min-h-11 items-center text-[var(--ed-night-soft)] transition hover:text-[var(--ed-night-ink)]";

// On night: a reassurance trio, the links, and a dry line to sign off.
export default function EdFooter({ logo, data, links }: { logo: React.ReactNode; data: SiteData; links: EdNavLink[] }) {
  const { contact, socialLinks, content } = data;
  const whatsapp = contact.whatsappDigits ? whatsappUrl(contact.whatsappDigits) : null;

  const trio = [
    { label: "Response", text: `Replies ${site.responseTime}` },
    { label: "Coverage", text: `Weddings, events & brands across ${site.location.country}` },
    whatsapp ? { label: "Booking", text: "Chat on WhatsApp", href: whatsapp } : null,
  ].filter((t) => t !== null);

  return (
    // Bottom padding on small screens keeps the last links clear of the sticky CTA bar.
    <footer className="ed-night pb-28 pt-16 sm:pt-24 lg:pb-10">
      <div className="ed-wrap">
        <ul className="grid gap-px border-y border-[var(--ed-night-line)] sm:grid-cols-3">
          {trio.map((t) => (
            <li key={t.label} className="py-6 sm:pr-8">
              <p className="ed-label">({t.label}.)</p>
              {t.href ? (
                <a href={t.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-[1.0625rem] underline-offset-4 hover:underline">
                  {t.text} →
                </a>
              ) : (
                <p className="mt-2 flex min-h-11 items-center text-[1.0625rem]">{t.text}</p>
              )}
            </li>
          ))}
        </ul>

        {content.footer_tagline ? (
          <p className="ed-display ed-h2 mt-16 italic sm:mt-24">{content.footer_tagline}</p>
        ) : null}

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label={`${site.name}, home`} className="inline-block">
              {logo}
            </Link>
            <p className="mt-4 max-w-xs text-[var(--ed-night-soft)]">Photography &amp; film from {locationLabel}.</p>
          </div>

          <nav aria-label="Footer">
            <p className="ed-label">(Explore.)</p>
            <ul className="mt-3">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              {[
                { href: "/work", label: "All work" },
                { href: "/about", label: "About Zack" },
                { href: "/clients", label: "All clients" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="ed-label">(Contact.)</p>
            <ul className="mt-3">
              {whatsapp ? (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {contact.phone ? (
                <li>
                  <a href={telUrl(contact.phone)} className={linkClass}>
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className={`${linkClass} break-all`}>
                    {contact.email}
                  </a>
                </li>
              ) : null}
              <li className="flex min-h-11 items-center text-[var(--ed-night-soft)]">{locationLabel}</li>
            </ul>
          </div>

          {socialLinks.length ? (
            <div>
              <p className="ed-label">(Follow.)</p>
              <ul className="mt-3">
                {socialLinks.map((s) => (
                  <li key={s.platform}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {SOCIAL_LABELS[s.platform] ?? s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-[var(--ed-night-line)] pt-6 text-sm text-[var(--ed-night-soft)] lg:flex-row lg:items-center lg:justify-between">
          {content.editorial_footer_line ? <p className="ed-display text-[1.375rem] italic text-[var(--ed-night-ink)]">{content.editorial_footer_line}</p> : null}
          <p className="flex flex-wrap items-center gap-x-5">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <Link href="/privacy" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-[var(--ed-night-ink)] hover:underline">
              Privacy policy
            </Link>
            <span>
              Website by{" "}
              <a
                href={site.credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline-offset-4 hover:text-[var(--ed-night-ink)] hover:underline"
              >
                {site.credit.name}
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
