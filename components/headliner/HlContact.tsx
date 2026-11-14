"use client";

import InView from "@/components/headliner/InView";
import { Kicker, SplitWords } from "@/components/headliner/Kinetic";
import InstagramReelCard from "@/components/InstagramReelCard";
import SocialLinks from "@/components/SocialLinks";
import { IconArrowRight, IconClose, IconMail, IconPhone, IconPin, IconWhatsapp } from "@/components/icons";
import { planSelection } from "@/lib/planSelection";
import { useContactSubmit } from "@/lib/useContactSubmit";
import { locationLabel, responsePromise } from "@/lib/site";
import { telUrl, whatsappUrl } from "@/lib/contact";
import type { ContactDetails } from "@/lib/siteData";
import type { SocialLink } from "@/lib/types";
import type { InstagramReel } from "@/lib/instagram";

export default function HlContact({
  description,
  contact,
  socialLinks,
  instagramReel,
}: {
  description: string;
  contact: ContactDetails;
  socialLinks: SocialLink[];
  instagramReel: InstagramReel | null;
}) {
  const { handleSubmit, submitting, error, selected } = useContactSubmit(contact);

  return (
    <section id="contact" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-20 hidden h-[32rem] w-[32rem] rounded-full bg-[var(--hl-violet)] opacity-20 blur-[120px] lg:block"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <InView>
          <Kicker n="05">Get in touch</Kicker>
          <h2 className="hl-display mt-5 text-[clamp(3.4rem,16vw,10rem)]">
            <SplitWords text="Let's make" /> <span className="hl-em">noise.</span>
          </h2>
          <p className="hl-rise mt-5 max-w-xl text-[1.1rem] text-[var(--text-secondary)]" style={{ "--d": "250ms" } as React.CSSProperties}>
            {description}
          </p>
          <p
            className="hl-rise mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 px-4 py-2 font-mono text-[0.8rem] uppercase tracking-[0.16em]"
            style={{ "--d": "350ms" } as React.CSSProperties}
          >
            <span aria-hidden className="hl-live-dot" /> On air · {responsePromise}
          </p>
        </InView>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <ul>
              {contact.phone ? (
                <li>
                  <a href={telUrl(contact.phone)} className="group flex min-h-14 items-center gap-4 border-b border-[var(--border-subtle)]">
                    <IconPhone aria-hidden className="h-5 w-5 shrink-0 text-[var(--hl-volt)]" />
                    <span className="hl-display text-[clamp(1.8rem,7vw,2.6rem)] transition group-hover:text-[var(--accent-gold)]">{contact.phone}</span>
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className="flex min-h-14 items-center gap-4 break-all border-b border-[var(--border-subtle)] text-[1.05rem] text-[var(--text-secondary)] hover:text-[var(--accent-gold-bright)]">
                    <IconMail aria-hidden className="h-5 w-5 shrink-0 text-[var(--hl-volt)]" />
                    {contact.email}
                  </a>
                </li>
              ) : null}
              <li className="flex min-h-14 items-center gap-4 border-b border-[var(--border-subtle)] text-[1.05rem] text-[var(--text-secondary)]">
                <IconPin aria-hidden className="h-5 w-5 shrink-0 text-[var(--hl-volt)]" />
                {locationLabel}
              </li>
            </ul>

            {contact.whatsappDigits ? (
              <a
                href={whatsappUrl(contact.whatsappDigits, "Hi! I'd like to know more about your photography and video services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl bg-[#25D366] p-5 text-[var(--hl-ink)] transition hover:-rotate-1"
              >
                <IconWhatsapp aria-hidden className="h-9 w-9 shrink-0" />
                <span>
                  <span className="hl-display block text-[1.9rem]">Skip the form</span>
                  <span className="block text-base font-medium">Chat with us on WhatsApp</span>
                </span>
                <IconArrowRight aria-hidden className="ml-auto h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
              </a>
            ) : null}

            <SocialLinks links={socialLinks} />
            {instagramReel ? (
              <div className="lg:self-start">
                <InstagramReelCard reel={instagramReel} />
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/15 bg-[var(--bg-dark-alt)] p-5 sm:p-8">
            <p className="flex items-center justify-between font-mono text-[0.75rem] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <span>Guest list</span>
              <span aria-hidden>Admit one</span>
            </p>
            <div className="mt-6 space-y-6">
              {selected.length > 0 ? (
                <div className="rounded-xl border border-[var(--hl-volt)]/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="field-label">Your selection</p>
                    <a href="#pricing" className="inline-flex min-h-11 items-center text-base text-[var(--accent-gold-bright)] underline-offset-4 hover:underline">
                      Edit
                    </a>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {selected.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <span className="flex-1">
                          {item.name}
                          <span className="text-[var(--text-secondary)]">
                            {" "}
                            · {item.group}
                            {item.price ? ` · ${item.price}` : ""}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => planSelection.remove(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-gold-bright)]"
                        >
                          <IconClose className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Field label="Name" name="name" type="text" autoComplete="name" required maxLength={200} />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} />
              <Field label="Email (optional)" name="email" type="email" autoComplete="email" maxLength={320} />
              <div>
                <label htmlFor="hl-contact-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="hl-contact-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  placeholder="The date, the place, the vision"
                  className="field-input resize-y"
                />
              </div>

              {error ? (
                <p role="alert" className="text-red-300">
                  {error}
                </p>
              ) : null}

              <div>
                <button type="submit" disabled={submitting} className="hl-btn w-full !min-h-14 !text-base">
                  {submitting ? "Sending…" : "Send message"} <IconArrowRight aria-hidden className="h-5 w-5" />
                </button>
                <p className="mt-3 text-base text-[var(--text-secondary)]">
                  {contact.whatsappDigits ? "Your message opens in WhatsApp, ready to send. " : null}
                  {responsePromise}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `hl-contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} name={name} {...props} className="field-input" />
    </div>
  );
}
