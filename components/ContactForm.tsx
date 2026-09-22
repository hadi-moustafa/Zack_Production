"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { IconArrowRight, IconClose, IconMail, IconPhone, IconPin } from "@/components/icons";
import SocialLinks from "@/components/SocialLinks";
import Reveal from "@/components/Reveal";
import { PLAN_SELECTED_EVENT } from "@/lib/planSelection";
import type { SocialLink } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

function buildWhatsAppUrl(whatsappNumber: string, message: string) {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function ContactForm({
  description,
  phone,
  email,
  whatsappNumber,
  locationText,
  socialLinks,
  backgroundPhotoPath,
}: {
  description: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  locationText: string;
  socialLinks: SocialLink[];
  backgroundPhotoPath: string | null;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [waFallbackUrl, setWaFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    const onPlanSelected = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") setSelectedPlan(detail);
    };
    window.addEventListener(PLAN_SELECTED_EVENT, onPlanSelected);
    return () => window.removeEventListener(PLAN_SELECTED_EVENT, onPlanSelected);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const customerPhone = String(formData.get("phone") || "").trim();
    const customerEmail = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !customerPhone || !message) {
      setError("Please fill in your name, phone, and message.");
      return;
    }

    const lines = [
      `New inquiry from ${name}`,
      `Phone: ${customerPhone}`,
      customerEmail ? `Email: ${customerEmail}` : null,
      selectedPlan ? `Package: ${selectedPlan}` : null,
      "",
      message,
    ].filter((l): l is string => l !== null);

    const waUrl = buildWhatsAppUrl(whatsappNumber, lines.join("\n"));

    // Open synchronously, inside the click handler, so browsers don't treat
    // it as a blocked popup (an await before this would lose that gesture).
    const waWindow = window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!waWindow) {
      window.location.href = waUrl;
    }
    setWaFallbackUrl(waUrl);

    setStatus("submitting");

    // Best-effort lead save — don't block the WhatsApp handoff on it.
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: customerEmail || undefined,
        phone: customerPhone,
        message: selectedPlan ? `Package: ${selectedPlan}\n\n${message}` : message,
      }),
    }).catch(() => {});

    setStatus("success");
    form.reset();
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 sm:py-28">
      {backgroundPhotoPath ? (
        <Image
          src={photoPublicUrl(backgroundPhotoPath)}
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover opacity-20"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-dark)] via-[var(--bg-dark)]/90 to-[var(--bg-dark)]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal>
            <div className="section-index">
              <span className="num">04</span>
              <span className="line" />
              <span className="eyebrow">Get in touch</span>
            </div>
            <h2 className="font-serif-display mt-4 text-[clamp(2.25rem,7vw,3.75rem)] font-semibold leading-[1.02] text-[var(--text-primary)]">
              Let&apos;s Work Together
            </h2>
            <p className="mt-6 text-[clamp(0.95rem,2.4vw,1.05rem)] leading-relaxed text-[var(--text-secondary)]">
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
          </Reveal>

          <Reveal delay={100}>
            {status === "success" ? (
              <div className="rounded-lg border border-[var(--accent-gold)]/50 bg-[var(--bg-dark-alt)] p-8">
                <p className="text-[var(--text-primary)]">
                  We opened WhatsApp with your message ready to go — just hit send there.
                </p>
                {waFallbackUrl ? (
                  <a
                    href={waFallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost mt-5"
                  >
                    Didn&apos;t open? Click here <IconArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 block text-sm text-[var(--text-secondary)] underline hover:text-[var(--accent-gold)]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedPlan ? (
                  <div className="flex items-center justify-between rounded-md border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 px-3 py-2 text-sm text-[var(--accent-gold)]">
                    <span>Package: {selectedPlan}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      aria-label="Clear selected package"
                      className="text-[var(--accent-gold)]/70 hover:text-[var(--accent-gold)]"
                    >
                      <IconClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}

                <input
                  name="name"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Name"
                  className="w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-1 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none"
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                  placeholder="Phone"
                  className="w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-1 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-gold)] focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  maxLength={320}
                  placeholder="Email (optional)"
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
                  {status === "submitting" ? "Opening WhatsApp…" : "Send message"}{" "}
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={200}>
            <h3 className="font-serif-display text-2xl font-semibold text-[var(--text-primary)]">
              Follow Me
            </h3>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              See more of my work and behind-the-scenes moments.
            </p>
            <div className="mt-5">
              <SocialLinks links={socialLinks} iconClassName="h-4 w-4" className="flex-wrap" />
            </div>
            <p className="font-script mt-8 text-xl text-[var(--accent-gold)]">
              Let&apos;s create something beautiful
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
