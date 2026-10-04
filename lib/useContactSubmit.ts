"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanSelection, describeSelection } from "@/lib/planSelection";
import { LAST_WHATSAPP_URL_KEY, whatsappUrl } from "@/lib/contact";
import type { ContactDetails } from "@/lib/siteData";

// The contact form's hand-off, shared by every design: open WhatsApp with a
// prefilled message, save the lead, then go to /thank-you.
export function useContactSubmit(contact: ContactDetails) {
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

  return { handleSubmit, submitting, error, selected };
}
