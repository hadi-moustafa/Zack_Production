"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { photoPublicUrl } from "@/lib/media";
import { IconArrowRight, IconClose, IconMail, IconPhone, IconPin, IconWhatsapp } from "@/components/icons";
import SocialShowcase from "@/components/SocialShowcase";
import Reveal from "@/components/Reveal";
import { Flourish } from "@/components/Ornaments";
import { planSelection, usePlanSelection, describeSelection } from "@/lib/planSelection";
import { locationLabel, responsePromise } from "@/lib/site";
import { LAST_WHATSAPP_URL_KEY, telUrl, whatsappUrl } from "@/lib/contact";
import type { ContactDetails } from "@/lib/siteData";
import type { SocialLink } from "@/lib/types";
import type { InstagramReel } from "@/lib/instagram";

export default function ContactForm({
  description,
  contact,
  socialLinks,
  instagramReel,
  backgroundPhotoPath,
}: {
  description: string;
  contact: ContactDetails;
  socialLinks: SocialLink[];
  instagramReel: InstagramReel | null;
  backgroundPhotoPath: string | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = usePlanSelection();
  const selectionText = describeSelection(selected);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const customerPhone = String(formData.get("phone") || "").trim();
    const customerEmail = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !customerPhone || !message) {
      setError("Please fill in your name, phone and message.");
      return;
    }

    setSubmitting(true);

    // Open WhatsApp synchronously, inside the submit handler, so browsers
    // don't treat it as a blocked popup (an await first would lose the gesture).
    if (contact.whatsappDigits) {
      const lines = [
        `New inquiry from ${name}`,
        `Phone: ${customerPhone}`,
        customerEmail ? `Email: ${customerEmail}` : null,
        selectionText ? `\nInterested in:\n${selectionText}` : null,
        "",
        message,
      ].filter((l): l is string => l !== null);
      const waUrl = whatsappUrl(contact.whatsappDigits, lines.join("\n"));
      try {
        sessionStorage.setItem(LAST_WHATSAPP_URL_KEY, waUrl);
      } catch {
        // Storage blocked: the thank-you page falls back to a plain chat link.
      }
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    // Save the lead too; keepalive lets it finish while we navigate away.
    fetch("/api/contact", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: customerEmail || undefined,
        phone: customerPhone,
        message: selectionText ? `Interested in:\n${selectionText}\n\n${message}` : message,
      }),
    }).catch(() => {});

    router.push("/thank-you");
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      {backgroundPhotoPath ? (
        <Image
          src={photoPublicUrl(backgroundPhotoPath)}
          alt=""
          aria-hidden
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover opacity-20"
        />
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[var(--bg-dark)] via-[var(--bg-dark)]/90 to-[var(--bg-dark)]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="section-index justify-center">
            <span className="num">IV</span>
            <span className="line" />
            <span className="eyebrow">Get in touch</span>
          </div>
          <h2 className="font-serif-display mt-4 text-[clamp(2.5rem,9vw,4.25rem)] font-medium leading-[1] text-[var(--text-primary)]">
            Let&apos;s Work Together
          </h2>
          <Flourish center />
          <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--text-secondary)] sm:text-[1.1rem]">
            {description}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent-gold)]/40 px-4 py-2 text-[0.95rem] text-[var(--accent-gold-bright)]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent-gold-bright)]" />
            {responsePromise}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col">
            <ul className="space-y-1">
              {contact.phone ? (
                <li>
                  <a href={telUrl(contact.phone)} className="flex min-h-11 items-center gap-3 text-[var(--text-secondary)] hover:text-[var(--accent-gold-bright)]">
                    <IconPhone aria-hidden className="h-5 w-5 shrink-0 text-[var(--accent-gold)]" />
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className="flex min-h-11 items-center gap-3 break-all text-[var(--text-secondary)] hover:text-[var(--accent-gold-bright)]">
                    <IconMail aria-hidden className="h-5 w-5 shrink-0 text-[var(--accent-gold)]" />
                    {contact.email}
                  </a>
                </li>
              ) : null}
              <li className="flex min-h-11 items-center gap-3 text-[var(--text-secondary)]">
                <IconPin aria-hidden className="h-5 w-5 shrink-0 text-[var(--accent-gold)]" />
                {locationLabel}
              </li>
            </ul>

            {contact.whatsappDigits ? (
              <a
                href={whatsappUrl(contact.whatsappDigits, "Hi! I'd like to know more about your photography and video services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-8 flex items-center gap-4 overflow-hidden rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 p-5 transition hover:border-[#25D366] hover:bg-[#25D366]/15"
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40 motion-reduce:hidden" />
                  <IconWhatsapp aria-hidden className="relative h-6 w-6" />
                </span>
                <span>
                  <span className="block font-semibold text-[var(--text-primary)]">Prefer WhatsApp?</span>
                  <span className="block text-[0.95rem] text-[var(--text-secondary)]">
                    Skip the form and chat with us directly.
                  </span>
                </span>
                <IconArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-[var(--text-secondary)] transition group-hover:translate-x-1 group-hover:text-[#25D366]" />
              </a>
            ) : null}

            <p className="font-script mt-auto pt-10 text-2xl text-[var(--accent-gold-bright)]">
              Let&apos;s create something beautiful
            </p>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {selected.length > 0 ? (
                <div className="rounded-lg border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/[0.07] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="field-label">Your selection</p>
                    <a href="#pricing" className="inline-flex min-h-11 items-center text-[0.95rem] text-[var(--accent-gold-bright)] underline-offset-4 hover:underline">
                      Edit
                    </a>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {selected.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <span className="flex-1 text-[var(--text-primary)]">
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
                <label htmlFor="contact-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  placeholder="Tell us about the date, place and what you have in mind"
                  className="field-input resize-y"
                />
              </div>

              {error ? (
                <p role="alert" className="text-red-300">
                  {error}
                </p>
              ) : null}

              <div>
                <button type="submit" disabled={submitting} className="btn-gold w-full justify-center disabled:opacity-60 sm:w-auto">
                  {submitting ? "Sending…" : "Send message"} <IconArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-[0.95rem] text-[var(--text-secondary)]">
                  {contact.whatsappDigits
                    ? "Your message opens in WhatsApp, ready to send. "
                    : null}
                  {responsePromise}
                </p>
              </div>
            </form>
          </Reveal>
        </div>

        <SocialShowcase links={socialLinks} reel={instagramReel} />
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} name={name} {...props} className="field-input" />
    </div>
  );
}
