"use client";

import { useState } from "react";
import ContentManager from "@/components/admin/ContentManager";
import MediaLibrary, { type SectionSlot } from "@/components/admin/MediaLibrary";
import CategoriesManager from "@/components/admin/CategoriesManager";
import PricingManager from "@/components/admin/PricingManager";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import InstagramConnect, { type InstagramStatus } from "@/components/admin/InstagramConnect";
import ContactSubmissionsList from "@/components/admin/ContactSubmissionsList";
import AccountSettings from "@/components/admin/AccountSettings";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import type { Category, Photo, PricingPackage, PageContent, SocialLink, ContactSubmission } from "@/lib/types";

type TabId = "photos" | "films" | "categories" | "content" | "pricing" | "social" | "messages" | "account";

export default function AdminTabs({
  photos,
  categories: initialCategories,
  content,
  contentMap,
  pricingPackages,
  socialLinks,
  instagramStatus,
  submissions,
  userEmail,
}: {
  photos: Photo[];
  categories: Category[];
  content: PageContent[];
  contentMap: Record<string, string>;
  pricingPackages: PricingPackage[];
  socialLinks: SocialLink[];
  instagramStatus: InstagramStatus;
  submissions: ContactSubmission[];
  userEmail: string;
}) {
  const [tab, setTab] = useState<TabId>("photos");
  // Shared by the Photos, Films and Categories tabs so changes show everywhere.
  const [items, setItems] = useState<Photo[]>(photos);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [sectionPhotos, setSectionPhotos] = useState<Record<SectionSlot, string>>({
    about: contentMap[SECTION_PHOTO_KEYS.about] ?? "",
    contact: contentMap[SECTION_PHOTO_KEYS.contact] ?? "",
  });
  const photoCount = items.filter((p) => p.media_type !== "video").length;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "photos", label: "Photos", count: photoCount },
    { id: "films", label: "Films", count: items.length - photoCount },
    { id: "categories", label: "Categories", count: categories.length },
    { id: "content", label: "Page Text" },
    { id: "pricing", label: "Pricing", count: pricingPackages.length },
    { id: "social", label: "Social Links" },
    { id: "messages", label: "Messages", count: submissions.length },
    { id: "account", label: "Account" },
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
        {tab === "photos" ? (
          <MediaLibrary
            kind="photo"
            items={items}
            setItems={setItems}
            categories={categories}
            sectionPhotos={sectionPhotos}
            setSectionPhotos={setSectionPhotos}
          />
        ) : null}
        {tab === "films" ? (
          <MediaLibrary kind="video" items={items} setItems={setItems} categories={categories} />
        ) : null}
        {tab === "categories" ? (
          <CategoriesManager categories={categories} setCategories={setCategories} items={items} />
        ) : null}
        {tab === "content" ? <ContentManager initialContent={content} /> : null}
        {tab === "pricing" ? <PricingManager initialPackages={pricingPackages} /> : null}
        {tab === "social" ? (
          <div className="space-y-6">
            <SocialLinksManager initialLinks={socialLinks} />
            <InstagramConnect initialStatus={instagramStatus} />
          </div>
        ) : null}
        {tab === "messages" ? <ContactSubmissionsList submissions={submissions} /> : null}
        {tab === "account" ? <AccountSettings userEmail={userEmail} /> : null}
      </div>
    </div>
  );
}
