import type { SocialLink } from "@/lib/types";
import { SOCIAL_LABELS, SOCIAL_PLATFORMS } from "@/lib/social";
import {
  IconInstagram,
  IconFacebook,
  IconTiktok,
  IconWhatsapp,
  IconYoutube,
  IconTwitter,
} from "@/components/icons";

// Each platform in its own colours, so the icons are instantly recognisable.
// `icon` sizes the glyph so all marks look the same optical weight.
const BRAND: Record<
  string,
  { Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; bg: string; icon: string; glow: string }
> = {
  instagram: {
    Icon: IconInstagram,
    bg: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]",
    icon: "h-[1.3rem] w-[1.3rem]",
    glow: "hover:shadow-[0_10px_24px_-8px_rgba(214,36,159,0.7)]",
  },
  facebook: {
    Icon: IconFacebook,
    bg: "bg-[#1877F2]",
    icon: "h-[1.2rem] w-[1.2rem] translate-x-[0.5px]",
    glow: "hover:shadow-[0_10px_24px_-8px_rgba(24,119,242,0.75)]",
  },
  tiktok: {
    Icon: IconTiktok,
    bg: "bg-[#010101] ring-1 ring-white/20",
    icon: "h-[1.15rem] w-[1.15rem]",
    glow: "hover:shadow-[0_10px_24px_-8px_rgba(37,244,238,0.55)]",
  },
  whatsapp: {
    Icon: IconWhatsapp,
    bg: "bg-[#25D366]",
    icon: "h-[1.35rem] w-[1.35rem]",
    glow: "hover:shadow-[0_10px_24px_-8px_rgba(37,211,102,0.7)]",
  },
  youtube: {
    Icon: IconYoutube,
    bg: "bg-[#FF0000]",
    icon: "h-[1.3rem] w-[1.3rem]",
    glow: "hover:shadow-[0_10px_24px_-8px_rgba(255,0,0,0.65)]",
  },
  twitter: {
    Icon: IconTwitter,
    bg: "bg-black ring-1 ring-white/20",
    icon: "h-[1.05rem] w-[1.05rem]",
    glow: "hover:shadow-[0_10px_24px_-8px_rgba(255,255,255,0.3)]",
  },
};

export default function SocialLinks({ links, className = "" }: { links: SocialLink[]; className?: string }) {
  const active = links
    .filter((l) => l.url)
    .sort((a, b) => {
      const ai = SOCIAL_PLATFORMS.indexOf(a.platform as (typeof SOCIAL_PLATFORMS)[number]);
      const bi = SOCIAL_PLATFORMS.indexOf(b.platform as (typeof SOCIAL_PLATFORMS)[number]);
      return (ai === -1 ? SOCIAL_PLATFORMS.length : ai) - (bi === -1 ? SOCIAL_PLATFORMS.length : bi);
    });
  if (active.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {active.map((link) => {
        const brand = BRAND[link.platform];
        const label = SOCIAL_LABELS[link.platform] || link.platform;
        return (
          <li key={link.platform}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Zack Production on ${label}`}
              title={label}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 ${
                brand ? `${brand.bg} ${brand.glow}` : "border border-[var(--border-subtle)]"
              }`}
            >
              {brand ? (
                <brand.Icon aria-hidden className={brand.icon} />
              ) : (
                <span className="text-sm">{label.slice(0, 2)}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
