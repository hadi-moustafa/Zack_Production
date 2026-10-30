import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ThankYouActions from "@/components/ThankYouActions";
import { IconArrowRight } from "@/components/icons";
import EdLinkList from "@/components/editorial/EdLinkList";
import { getSiteData } from "@/lib/siteData";
import { designFrom } from "@/lib/design";
import { whatsappUrl } from "@/lib/contact";
import { site, responsePromise, baseOpenGraph } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your message to Zack Production is on its way. We reply within 24 hours.",
  alternates: { canonical: "/thank-you" },
  openGraph: { ...baseOpenGraph, url: "/thank-you" },
  robots: { index: false, follow: true },
};

export default async function ThankYouPage() {
  const { contact, socialLinks, content } = await getSiteData();
  const instagram = socialLinks.find((l) => l.platform === "instagram");
  const fallbackUrl = contact.whatsappDigits ? whatsappUrl(contact.whatsappDigits) : null;

  if (designFrom(content) === "editorial") {
    return (
      <main className="flex-1">
        <PageHeader crumbs={[{ name: "Thank You", path: "/thank-you" }]} eyebrow="Message sent" title="Thank you.">
          <p className="ed-lead mt-6">
            Your message is on its way to {site.name}. {responsePromise} If WhatsApp opened, just tap send there so it reaches us
            straight away.
          </p>
          <div className="mt-8">
            <ThankYouActions fallbackUrl={fallbackUrl} className="ed-btn" />
          </div>
        </PageHeader>

        <nav aria-label="While you wait" className="ed-wrap py-[var(--ed-section-y)]">
          <p className="ed-label">While you wait</p>
          <EdLinkList
            className="mt-6"
            rows={[
              { href: "/work", title: "Browse the work", meta: "Films & photos by category" },
              { href: "/about", title: `Meet ${site.founder}`, meta: "Behind the lens" },
              instagram
                ? { href: instagram.url, title: "Latest reels on Instagram", meta: "Follow along", external: true }
                : { href: "/#pricing", title: "Compare packages", meta: "The rate card" },
            ]}
          />
        </nav>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <PageHeader crumbs={[{ name: "Thank You", path: "/thank-you" }]} eyebrow="Message sent" title="Thank you">
        <p className="mt-6 max-w-xl text-[1.1rem] leading-relaxed text-[var(--text-secondary)]">
          Your message is on its way to Zack Production. {responsePromise} If WhatsApp opened, just tap send there
          so it reaches us straight away.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ThankYouActions fallbackUrl={fallbackUrl} />
        </div>
      </PageHeader>

      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-10 sm:py-20">
        <h2 className="font-serif-display text-3xl font-semibold text-[var(--text-primary)]">While you wait</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          <li>
            <Link
              href="/work"
              className="group flex h-full min-h-28 flex-col justify-between rounded-xl border border-[var(--border-subtle)] p-6 transition hover:border-[var(--accent-gold)]"
            >
              <span className="text-lg font-semibold text-[var(--text-primary)]">Browse wedding & event films</span>
              <span className="mt-3 inline-flex items-center gap-2 text-[var(--accent-gold-bright)]">
                See the work <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
          {instagram ? (
            <li>
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full min-h-28 flex-col justify-between rounded-xl border border-[var(--border-subtle)] p-6 transition hover:border-[var(--accent-gold)]"
              >
                <span className="text-lg font-semibold text-[var(--text-primary)]">Follow Zack Production on Instagram</span>
                <span className="mt-3 inline-flex items-center gap-2 text-[var(--accent-gold-bright)]">
                  Latest reels <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            </li>
          ) : (
            <li>
              <Link
                href="/#pricing"
                className="group flex h-full min-h-28 flex-col justify-between rounded-xl border border-[var(--border-subtle)] p-6 transition hover:border-[var(--accent-gold)]"
              >
                <span className="text-lg font-semibold text-[var(--text-primary)]">Compare photography packages</span>
                <span className="mt-3 inline-flex items-center gap-2 text-[var(--accent-gold-bright)]">
                  View pricing <IconArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
