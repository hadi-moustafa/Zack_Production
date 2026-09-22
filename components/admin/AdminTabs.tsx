"use client";

import { useState } from "react";
import ContentManager from "@/components/admin/ContentManager";
import PhotosManager from "@/components/admin/PhotosManager";
import PricingManager from "@/components/admin/PricingManager";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import ContactSubmissionsList from "@/components/admin/ContactSubmissionsList";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import type { Photo, PricingPackage, PageContent, SocialLink, ContactSubmission } from "@/lib/types";

type TabId = "media" | "content" | "pricing" | "social" | "messages";

export default function AdminTabs({
  photos,
  content,
  contentMap,
  pricingPackages,
  socialLinks,
  submissions,
}: {
  photos: Photo[];
  content: PageContent[];
  contentMap: Record<string, string>;
  pricingPackages: PricingPackage[];
  socialLinks: SocialLink[];
  submissions: ContactSubmission[];
}) {
  const [tab, setTab] = useState<TabId>("media");

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "media", label: "Photos & Videos", count: photos.length },
    { id: "content", label: "Page Text" },
    { id: "pricing", label: "Pricing", count: pricingPackages.length },
    { id: "social", label: "Social Links" },
    { id: "messages", label: "Messages", count: submissions.length },
  ];

  return (
    <div>
      <nav className="sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 ? (
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.7rem] ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "media" ? (
          <PhotosManager
            initialPhotos={photos}
            initialSectionPhotos={{
              hero: contentMap[SECTION_PHOTO_KEYS.hero],
              about: contentMap[SECTION_PHOTO_KEYS.about],
              contact: contentMap[SECTION_PHOTO_KEYS.contact],
            }}
          />
        ) : null}
        {tab === "content" ? <ContentManager initialContent={content} /> : null}
        {tab === "pricing" ? <PricingManager initialPackages={pricingPackages} /> : null}
        {tab === "social" ? <SocialLinksManager initialLinks={socialLinks} /> : null}
        {tab === "messages" ? <ContactSubmissionsList submissions={submissions} /> : null}
      </div>
    </div>
  );
}
