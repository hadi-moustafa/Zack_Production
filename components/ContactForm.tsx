"use client";

import { useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { IconArrowRight, IconMail, IconPhone, IconPin } from "@/components/icons";
import SocialLinks from "@/components/SocialLinks";
import type { SocialLink } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({
  description,
  phone,
  email,
  locationText,
  socialLinks,
  backgroundPhotoPath,
}: {
  description: string;
  phone: string;
  email: string;
  locationText: string;
  socialLinks: SocialLink[];
  backgroundPhotoPath: string | null;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[var(--bg-dark)] py-24">
      {backgroundPhotoPath ? (
        <Image
          src={photoPublicUrl(backgroundPhotoPath)}
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover opacity-25"
        />
      ) : null}
      <div className="absolute inset-0 bg-[var(--bg-dark)]/80" />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <p className="eyebrow">Get in touch</p>
            <h2 className="font-serif-display mt-4 text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
              Let&apos;s Work Together
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>

            <div className="mt-8 space-y-4">
              {phone ? (
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <IconPhone className="h-4 w-4 text-[var(--accent-gold)]" />
                  {phone}
                </div>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-gold)]"
                >
                  <IconMail className="h-4 w-4 text-[var(--accent-gold)]" />
                  {email}
                </a>
              ) : null}
              {locationText ? (
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <IconPin className="h-4 w-4 text-[var(--accent-gold)]" />
                  {locationText}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            {status === "success" ? (
              <div className="rounded-lg border border-[var(--border-subtle)] p-8">
                <p className="text-[var(--text-primary)]">
                  Thanks for reaching out — I&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Name"
                  className="w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-1 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={320}
                  placeholder="Email"
                  className="w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-1 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none"
                />
                <input
                  name="phone"
                  type="tel"
                  maxLength={40}
                  placeholder="Phone (optional)"
                  className="w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-1 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none"
                />
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={5000}
                  placeholder="Message"
                  className="w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-1 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none"
                />

                {error ? <p className="text-sm text-red-400">{error}</p> : null}

                <button type="submit" disabled={status === "submitting"} className="btn-gold mt-2 disabled:opacity-50">
                  {status === "submitting" ? "Sending…" : "Send message"} <IconArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <div>
            <h3 className="font-serif-display text-2xl font-semibold text-[var(--text-primary)]">
              Follow Me
            </h3>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              See more of my work and behind-the-scenes moments.
            </p>
            <div className="mt-5">
              <SocialLinks links={socialLinks} iconClassName="h-4 w-4" />
            </div>
            <p className="font-script mt-8 text-xl text-[var(--accent-gold)]">
              Let&apos;s create something beautiful
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
