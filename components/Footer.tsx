import Link from "next/link";

export default function Footer({
  photographerName,
  tagline,
}: {
  photographerName: string;
  tagline: string;
}) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-dark)] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
        <span className="font-script text-4xl text-[var(--accent-gold)]">{photographerName}</span>
        {tagline ? (
          <p className="text-xs text-[var(--text-secondary)]">
            {tagline} · © {new Date().getFullYear()}
          </p>
        ) : null}
        <div className="flex flex-col items-center gap-1 text-xs text-[var(--text-secondary)] sm:items-end">
          <p>
            Made with <span aria-hidden>♥</span> by SE HM
            <span className="mx-2 text-[var(--border-subtle)]">·</span>
            <a href="tel:+96181277281" className="transition hover:text-[var(--accent-gold)]">
              +961 81 277281
            </a>
          </p>
          <Link href="/admin/dashboard" className="transition hover:text-[var(--accent-gold)]">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
