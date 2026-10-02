import type { SocialLink } from "@/lib/types";
import type { InstagramReel } from "@/lib/instagram";
import InstagramReelCard from "@/components/InstagramReelCard";
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

// Brand-true colors on purpose here — this is the one place on the site
// meant to pop with each platform's own identity rather than the gold/dark
// editorial palette.
const BRAND_BG: Record<string, string> = {
  instagram: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  facebook: "bg-[#1877F2]",
  tiktok: "bg-gradient-to-br from-[#25F4EE] via-[#0a0a0a] to-[#FE2C55]",
  whatsapp: "bg-[#25D366]",
  youtube: "bg-[#FF0000]",
  twitter: "bg-neutral-900",
};

const BRAND_GLOW: Record<string, string> = {
  instagram: "hover:shadow-[0_20px_45px_-15px_rgba(238,42,123,0.65)]",
  facebook: "hover:shadow-[0_20px_45px_-15px_rgba(24,119,242,0.65)]",
  tiktok: "hover:shadow-[0_20px_45px_-15px_rgba(37,244,238,0.5)]",
  whatsapp: "hover:shadow-[0_20px_45px_-15px_rgba(37,211,102,0.65)]",
  youtube: "hover:shadow-[0_20px_45px_-15px_rgba(255,0,0,0.6)]",
  twitter: "hover:shadow-[0_20px_45px_-15px_rgba(255,255,255,0.25)]",
};

export default function SocialShowcase({
  links,
  reel,
}: {
  links: SocialLink[];
  reel: InstagramReel | null;
}) {
  const active = links
    .filter((l) => l.url)
    .sort((a, b) => {
      const ai = SOCIAL_PLATFORMS.indexOf(a.platform as (typeof SOCIAL_PLATFORMS)[number]);
      const bi = SOCIAL_PLATFORMS.indexOf(b.platform as (typeof SOCIAL_PLATFORMS)[number]);
      return (ai === -1 ? SOCIAL_PLATFORMS.length : ai) - (bi === -1 ? SOCIAL_PLATFORMS.length : bi);
    });

  if (active.length === 0 && !reel) return null;

  const instagramUrl =
    links.find((l) => l.platform === "instagram" && l.url)?.url ||
    (reel?.username ? `https://instagram.com/${reel.username}` : "");

  return (
    <div className="mt-16 border-t border-[var(--border-subtle)] pt-14 sm:mt-20 sm:pt-16">
      <div className="text-center">
        <p className="font-script text-2xl text-[var(--accent-gold-bright)]">Stay in the frame</p>
        <h3 className="font-serif-display mt-2 text-[clamp(1.75rem,5vw,2.75rem)] font-semibold text-[var(--text-primary)]">
          Follow Along
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-secondary)]">
          Behind-the-scenes moments, new shoots, and reels drop here first.
        </p>
      </div>

      {reel ? (
        <div className="mx-auto mt-10 grid max-w-4xl items-center gap-10 md:grid-cols-[18rem_1fr] md:gap-14">
          <InstagramReelCard reel={reel} />
          <div className="text-center md:text-left">
            <p className="eyebrow">New on Instagram</p>
            {reel.caption ? (
              <p className="font-script mt-3 line-clamp-3 text-2xl leading-snug text-[var(--text-primary)]">
                {reel.caption}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_15px_35px_-12px_rgba(238,42,123,0.7)]"
              >
                <IconInstagram className="h-4 w-4" /> Watch the reel
              </a>
              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !rounded-full !py-3 !text-sm !normal-case !tracking-normal">
                  Follow{reel.username ? ` @${reel.username}` : ""}
                </a>
              ) : null}
            </div>
            {active.length > 0 ? <Tiles links={active} className="mt-8 grid-cols-2 sm:grid-cols-3" /> : null}
          </div>
        </div>
      ) : (
        <Tiles links={active} className="mx-auto mt-9 max-w-2xl grid-cols-2 sm:grid-cols-3 md:grid-cols-4" />
      )}
    </div>
  );
}

function Tiles({ links, className }: { links: SocialLink[]; className: string }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.platform];
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col items-center gap-3 rounded-2xl p-5 text-white transition-all duration-300 hover:-translate-y-1.5 ${BRAND_BG[link.platform] ?? "bg-neutral-800"} ${BRAND_GLOW[link.platform] ?? ""}`}
          >
            <span className="flex h-11 w-11 items-center justify-center">
              {Icon ? (
                <Icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <span className="text-xs">{link.platform}</span>
              )}
            </span>
            <span className="text-sm font-semibold tracking-wide">
              {SOCIAL_LABELS[link.platform] ?? link.platform}
            </span>
          </a>
        );
      })}
    </div>
  );
}
