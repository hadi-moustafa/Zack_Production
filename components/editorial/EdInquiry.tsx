"use client";

import InView from "@/components/headliner/InView";
import EdLabel from "@/components/editorial/EdLabel";
import InstagramReelCard from "@/components/InstagramReelCard";
import { IconWhatsapp } from "@/components/icons";
import { planSelection } from "@/lib/planSelection";
import { useContactSubmit } from "@/lib/useContactSubmit";
import { locationLabel, responsePromise } from "@/lib/site";
import { telUrl, whatsappUrl } from "@/lib/contact";
import type { ContactDetails } from "@/lib/siteData";
import type { InstagramReel } from "@/lib/instagram";

// One oversized sentence and one action (WhatsApp); the details in the label
// voice; the form second, for anyone who'd rather write it out.
export default function EdInquiry({
  headline,
  description,
  contact,
  instagramReel,
}: {
  headline: string;
  description: string;
  contact: ContactDetails;
  instagramReel: InstagramReel | null;
}) {
  const { handleSubmit, submitting, error, selected } = useContactSubmit(contact);

  return (
    <section id="contact" className="ed-section scroll-mt-16 border-t border-[var(--ed-line)]">
      <div className="ed-wrap">
        <InView>
          <EdLabel n={5}>Inquiries</EdLabel>
          <h2 className="ed-display ed-reveal mt-6 max-w-[16ch] text-[clamp(2.75rem,8vw,8rem)]" style={{ "--d": "100ms" } as React.CSSProperties}>
            {headline}
          </h2>
          {description ? (
            <p className="ed-lead ed-reveal mt-8 max-w-xl" style={{ "--d": "200ms" } as React.CSSProperties}>
              {description}
            </p>
          ) : null}
          {contact.whatsappDigits ? (
            <div className="ed-reveal mt-10" style={{ "--d": "300ms" } as React.CSSProperties}>
              <a
                href={whatsappUrl(contact.whatsappDigits, "Hi! I'd like to know more about your photography and video services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn"
              >
                <IconWhatsapp aria-hidden className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <p className="ed-label mt-4">{responsePromise}</p>
            </div>
          ) : null}
        </InView>

        <div className="mt-20 grid gap-16 border-t border-[var(--ed-line)] pt-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-10 lg:col-span-4">
            <dl className="grid gap-6">
              {contact.phone ? (
                <div>
                  <dt className="ed-label">Phone</dt>
                  <dd>
                    <a href={telUrl(contact.phone)} className="inline-flex min-h-11 items-center text-[1.125rem] underline-offset-4 hover:underline">
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {contact.email ? (
                <div>
                  <dt className="ed-label">Email</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center break-all text-[1.125rem] underline-offset-4 hover:underline">
                      {contact.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="ed-label">Studio</dt>
                <dd className="flex min-h-11 items-center text-[1.125rem]">{locationLabel}</dd>
              </div>
            </dl>
            {instagramReel ? (
              <div className="self-start">
                <InstagramReelCard reel={instagramReel} />
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 lg:col-start-6">
            <h3 className="ed-display text-[clamp(2rem,4vw,3rem)]">Send a message</h3>
            <div className="mt-8 space-y-7">
              {selected.length > 0 ? (
                <div className="bg-[var(--ed-bg-alt)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="field-label">Your selection</p>
                    <a href="#pricing" className="ed-link">
                      Edit
                    </a>
                  </div>
                  <ul className="mt-1">
                    {selected.map((item) => (
                      <li key={item.id} className="flex items-center gap-2 border-b border-[var(--ed-line)] last:border-0">
                        <span className="flex-1">
                          {item.name}
                          <span className="text-[var(--ed-ink-soft)]">
                            {" "}
                            · {item.group}
                            {item.price ? ` · ${item.price}` : ""}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => planSelection.remove(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--ed-ink-soft)] hover:text-[var(--ed-ink)]"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid gap-7 sm:grid-cols-2">
                <Field label="Name" name="name" type="text" autoComplete="name" required maxLength={200} />
                <Field label="Phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} />
              </div>
              <Field label="Email (optional)" name="email" type="email" autoComplete="email" maxLength={320} />
              <div>
                <label htmlFor="ed-contact-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="ed-contact-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  placeholder="The date, the place, the vision"
                  className="field-input resize-y"
                />
              </div>

              {error ? (
                <p role="alert" className="text-[#9b1c1c]">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col items-start gap-3">
                <button type="submit" disabled={submitting} className="ed-btn w-full sm:w-auto">
                  {submitting ? "Sending…" : "Send message →"}
                </button>
                {contact.whatsappDigits ? <p className="ed-body text-[1rem]">Your message opens in WhatsApp, ready to send.</p> : null}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `ed-contact-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} name={name} {...props} className="field-input" />
    </div>
  );
}
