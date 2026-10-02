import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { GA_ID } from "@/components/Analytics";
import { getSiteData } from "@/lib/siteData";
import { getLatestInstagramReel } from "@/lib/instagram";
import { site, locationLabel, baseOpenGraph } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Zack Production handles the details you share through the contact form and WhatsApp, the services that process them, and how to have them deleted.",
  alternates: { canonical: "/privacy" },
  openGraph: { ...baseOpenGraph, url: "/privacy" },
};

const updated = new Date(`${site.privacyUpdated}T12:00:00Z`);

export default async function PrivacyPage() {
  const [{ contact }, reel] = await Promise.all([getSiteData(), getLatestInstagramReel()]);
  const instagramConnected = reel !== null;

  // Every third party that can receive visitor data, shown only when it is
  // actually in use on the site.
  const processors = [
    {
      name: "Vercel",
      role: "Hosts the website. Like any web server, it receives your IP address and browser details when you load a page.",
      link: "https://vercel.com/legal/privacy-policy",
    },
    {
      name: "Supabase",
      role: "Stores the messages sent through the contact form, and the photos and videos shown on the site.",
      link: "https://supabase.com/privacy",
    },
    {
      name: "Resend",
      role: "Delivers an email notification to Zack Production when you send the contact form.",
      link: "https://resend.com/legal/privacy-policy",
    },
    {
      name: "WhatsApp (Meta)",
      role: "When you send the form, your message opens in WhatsApp so you can send it to us there. WhatsApp's own terms apply to that chat.",
      link: "https://www.whatsapp.com/legal/privacy-policy",
    },
    ...(instagramConnected
      ? [
          {
            name: "Instagram (Meta)",
            role: "Our latest Instagram reel plays from Instagram's servers, which receive your IP address when it loads.",
            link: "https://privacycenter.instagram.com/policy",
          },
        ]
      : []),
    ...(GA_ID
      ? [
          {
            name: "Google Analytics",
            role: "Counts visits and shows which pages are used, with IP anonymisation turned on. It sets first-party cookies (_ga, _ga_*).",
            link: "https://policies.google.com/privacy",
          },
        ]
      : []),
  ];

  return (
    <main className="flex-1">
      <PageHeader crumbs={[{ name: "Privacy Policy", path: "/privacy" }]} eyebrow="Legal" title="Privacy Policy">
        <p className="mt-6 text-[var(--text-secondary)]">
          Last updated{" "}
          <time dateTime={site.privacyUpdated}>
            {updated.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
          </time>
        </p>
      </PageHeader>

      <article className="prose-zp mx-auto max-w-3xl px-5 py-14 sm:px-10 sm:py-20">
        <p>
          {site.name} is a photography and videography studio run by {site.founder} in {locationLabel}. This page
          explains what we collect through this website, why, and who helps us process it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Contact form:</strong> your name, phone number, optional email address, your message and any
            package you selected. We use them only to reply to you and plan your shoot.
          </li>
          <li>
            <strong>Browser storage:</strong> the site remembers whether you turned its sound effects off
            (localStorage), and briefly keeps your WhatsApp message link so the thank-you page can reopen it
            (sessionStorage). Neither is sent to us.
          </li>
          <li>
            <strong>Server logs:</strong> our host records standard request data such as IP address and browser
            type to keep the site secure and running.
          </li>
        </ul>
        {GA_ID ? null : <p>We don&apos;t use advertising or analytics cookies.</p>}

        <h2>Services that process your data</h2>
        <ul>
          {processors.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong>: {p.role}{" "}
              <a href={p.link} target="_blank" rel="noopener noreferrer">
                Read {p.name}&apos;s privacy policy
              </a>
              .
            </li>
          ))}
        </ul>
        <p>We never sell your details or share them for marketing.</p>

        <h2>How long we keep it</h2>
        <p>
          Contact form messages are kept while we&apos;re talking about your project, and deleted on request. Photos
          and films of your event are shown on this site or our social media only with your permission.
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask to see, correct or delete the details you sent us at any time
          {contact.email ? (
            <>
              {" "}
              by emailing <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </>
          ) : null}
          {contact.phone ? (
            <>
              {contact.email ? " or" : ""} by calling {contact.phone}
            </>
          ) : null}
          . You can also <Link href="/#contact">reach us through the contact form</Link>.
        </p>

        <h2>Changes</h2>
        <p>
          If we change how we handle your data, we&apos;ll update this page and the date at the top. You can always{" "}
          <Link href="/">return to the Zack Production home page</Link> or{" "}
          <Link href="/#gallery">browse our latest wedding and event work</Link>.
        </p>
      </article>
    </main>
  );
}
