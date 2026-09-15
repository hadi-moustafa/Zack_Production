import type { SocialLink } from "@/lib/types";
import { IconInstagram, IconTiktok, IconYoutube, IconTwitter } from "@/components/icons";

const ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  instagram: IconInstagram,
  tiktok: IconTiktok,
  youtube: IconYoutube,
  twitter: IconTwitter,
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X / Twitter",
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
  const active = links.filter((l) => l.url);
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
            aria-label={LABELS[link.platform] || link.platform}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]"
          >
            {Icon ? <Icon className={iconClassName} /> : <span className="text-xs">{link.platform}</span>}
          </a>
        );
      })}
    </div>
  );
}
