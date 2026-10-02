import { cache } from "react";
import { supabasePublic } from "@/lib/supabasePublic";
import { withDefaults } from "@/lib/content";
import { SOCIAL_PLATFORMS } from "@/lib/social";
import type { PageContent, SocialLink } from "@/lib/types";

export type ContactDetails = {
  /** Display form, e.g. "+961 71 413 009". */
  phone: string | null;
  /** Digits only, for wa.me links. */
  whatsappDigits: string | null;
  email: string | null;
};

export type SiteData = {
  content: Record<string, string>;
  /** Only platforms with a URL, in canonical order. */
  socialLinks: SocialLink[];
  contact: ContactDetails;
};

function platformRank(platform: string) {
  const i = SOCIAL_PLATFORMS.indexOf(platform as (typeof SOCIAL_PLATFORMS)[number]);
  return i === -1 ? SOCIAL_PLATFORMS.length : i;
}

// The one place admin-editable site details are read from. Wrapped in
// React's cache() so the layout, page, metadata and structured data share a
// single round trip per request.
export const getSiteData = cache(async (): Promise<SiteData> => {
  const [contentRes, socialRes] = await Promise.all([
    supabasePublic.from("page_content").select("*"),
    supabasePublic.from("social_links").select("*"),
  ]);

  const content = withDefaults(
    Object.fromEntries(((contentRes.data ?? []) as PageContent[]).map((c) => [c.key, c.value]))
  );

  const socialLinks = ((socialRes.data ?? []) as SocialLink[])
    .filter((l) => l.url.trim())
    .sort((a, b) => platformRank(a.platform) - platformRank(b.platform));

  const whatsappDigits = content.whatsapp_number.replace(/\D/g, "");
  const email = content.footer_email.toLowerCase();

  return {
    content,
    socialLinks,
    contact: {
      phone: content.contact_phone || null,
      whatsappDigits: whatsappDigits.length >= 8 ? whatsappDigits : null,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    },
  };
});
