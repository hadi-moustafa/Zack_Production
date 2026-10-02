// Pure contact-link helpers shared by server and client components. Kept
// free of data-fetching imports so they add nothing to the client bundle.

/** sessionStorage key the thank-you page reads to offer a "didn't open?" link. */
export const LAST_WHATSAPP_URL_KEY = "zp-last-whatsapp-url";

export function whatsappUrl(digits: string, message?: string) {
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telUrl(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
