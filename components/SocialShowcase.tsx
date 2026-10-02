import type { SocialLink } from "@/lib/types";
import type { InstagramReel } from "@/lib/instagram";
import InstagramReelCard from "@/components/InstagramReelCard";
import { SOCIAL_LABELS, SOCIAL_PLATFORMS, socialHandle } from "@/lib/social";
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
        <p className="mx-auto mt-3 max-w-md text-[var(--text-secondary)]">
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
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_15px_35px_-12px_rgba(238,42,123,0.7)]"
              >
                <IconInstagram aria-hidden className="h-4 w-4" /> Watch the reel
              </a>
              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !rounded-full !py-3 !text-sm !normal-case !tracking-normal">
                  Follow{reel.username ? ` @${reel.username}` : ""}
                </a>
              ) : null}
            </div>
            {active.length > 0 ? <SocialButtons links={active} className="mt-8 md:justify-start" /> : null}
          </div>
        </div>
      ) : (
        <SocialButtons links={active} className="mx-auto mt-10 max-w-3xl" />
      )}
    </div>
  );
}

// Understated, uniform buttons: dark glass, thin border, gold icon ring.
// Centered and wrapping; full-width stacked on the smallest phones.
function SocialButtons({ links, className = "" }: { links: SocialLink[]; className?: string }) {
  return (
    <ul className={`flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      {links.map((link) => {
        const Icon = ICONS[link.platform];
        const label = SOCIAL_LABELS[link.platform] ?? link.platform;
        const handle = socialHandle(link.platform, link.url);
        return (
          <li key={link.platform}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Zack Production on ${label}${handle ? ` (${handle})` : ""}`}
              className="group flex min-h-16 items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white/[0.03] py-3 pl-3 pr-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-gold)]/70 hover:bg-white/[0.05] sm:min-w-[13.5rem]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--accent-gold)]/45 text-[var(--accent-gold-bright)] transition group-hover:border-[var(--accent-gold-bright)] group-hover:bg-[var(--accent-gold)]/10">
                {Icon ? <Icon aria-hidden className="h-5 w-5" /> : null}
              </span>
              <span className="flex-1 text-left">
                <span className="block font-semibold text-[var(--text-primary)]">{label}</span>
                <span className="block text-[0.9rem] text-[var(--text-secondary)]">{handle ?? "Follow us"}</span>
              </span>
              <span
                aria-hidden
                className="text-[var(--text-secondary)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-gold-bright)]"
              >
                ↗
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
