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

const ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  tiktok: IconTiktok,
  whatsapp: IconWhatsapp,
  youtube: IconYoutube,
  twitter: IconTwitter,
};

export default function SocialLinks({
  links,
  className = "",
  iconClassName = "h-4 w-4",
}: {
  links: SocialLink[];
  className?: string;
  iconClassName?: string;
}) {
  const active = links
    .filter((l) => l.url)
    .sort((a, b) => {
      const ai = SOCIAL_PLATFORMS.indexOf(a.platform as (typeof SOCIAL_PLATFORMS)[number]);
      const bi = SOCIAL_PLATFORMS.indexOf(b.platform as (typeof SOCIAL_PLATFORMS)[number]);
      return (ai === -1 ? SOCIAL_PLATFORMS.length : ai) - (bi === -1 ? SOCIAL_PLATFORMS.length : bi);
    });
  if (active.length === 0) return null;

  return (
    <div className={`flex gap-3 ${className}`}>
      {active.map((link) => {
        const Icon = ICONS[link.platform];
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SOCIAL_LABELS[link.platform] || link.platform}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] hover:shadow-[0_10px_25px_-10px_rgba(201,162,75,0.6)]"
          >
            {Icon ? <Icon className={iconClassName} /> : <span className="text-xs">{link.platform}</span>}
          </a>
        );
      })}
    </div>
  );
}
