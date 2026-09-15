import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import type { SocialLink } from "@/lib/types";

export default function Footer({
  photographerName,
  tagline,
  socialLinks,
}: {
  photographerName: string;
  tagline: string;
  socialLinks: SocialLink[];
}) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-dark)] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
        <span className="font-script text-2xl text-[var(--accent-gold)]">{photographerName}</span>
        {tagline ? (
          <p className="text-xs text-[var(--text-secondary)]">
            {tagline} · © {new Date().getFullYear()}
          </p>
        ) : null}
        <div className="flex items-center gap-5">
          <SocialLinks links={socialLinks} />
          <Link
            href="/admin/dashboard"
            className="text-xs text-[var(--text-secondary)] transition hover:text-[var(--accent-gold)]"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
