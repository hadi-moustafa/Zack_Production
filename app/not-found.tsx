import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import PageHeader from "@/components/PageHeader";
import { IconArrowRight } from "@/components/icons";
import { SECTIONS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist. Head back to Zack Production's photography and film work.",
};

export default function NotFound() {
  return (
    <SiteChrome>
      <main className="flex-1">
        <PageHeader crumbs={[{ name: "Page not found", path: "/404" }]} crumbsStructuredData={false} eyebrow="Error 404" title="Out of frame">
          <p className="mt-6 max-w-xl text-[1.1rem] leading-relaxed text-[var(--text-secondary)]">
            The page you&apos;re looking for has moved or never existed. Everything else is right where we left it.
          </p>
          <Link href="/" className="btn-gold mt-8">
            Back to the home page <IconArrowRight className="h-4 w-4" />
          </Link>
        </PageHeader>

        <nav aria-label="Popular sections" className="mx-auto max-w-3xl px-5 py-14 sm:px-10 sm:py-20">
          <h2 className="font-serif-display text-3xl font-semibold text-[var(--text-primary)]">Try one of these</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/#${s.id}`}
                  className="group flex h-full min-h-24 flex-col justify-between rounded-xl border border-[var(--border-subtle)] p-6 transition hover:border-[var(--accent-gold)]"
                >
                  <span className="text-lg font-semibold text-[var(--text-primary)]">{s.description}</span>
                  <span className="mt-3 inline-flex items-center gap-2 text-[var(--accent-gold-bright)]">
                    {s.label} <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </SiteChrome>
  );
}
