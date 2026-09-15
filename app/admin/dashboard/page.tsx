import { createServerSupabaseClient } from "@/lib/supabaseServer";
import LogoutButton from "@/components/admin/LogoutButton";
import PhotosManager from "@/components/admin/PhotosManager";
import PricingManager from "@/components/admin/PricingManager";
import ContentManager from "@/components/admin/ContentManager";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import ContactSubmissionsList from "@/components/admin/ContactSubmissionsList";
import type { Photo, PricingPackage, PageContent, SocialLink, ContactSubmission } from "@/lib/types";
import { withDefaults, SECTION_PHOTO_KEYS } from "@/lib/content";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [photosRes, pricingRes, contentRes, socialRes, submissionsRes] = await Promise.all([
    supabase.from("photos").select("*").order("sort_order", { ascending: true }),
    supabase.from("pricing_packages").select("*").order("sort_order", { ascending: true }),
    supabase.from("page_content").select("*"),
    supabase.from("social_links").select("*"),
    supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  const pricingPackages = (pricingRes.data ?? []).map((p) => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
  })) as PricingPackage[];
  const content = (contentRes.data ?? []) as PageContent[];
  const contentMap = withDefaults(Object.fromEntries(content.map((c) => [c.key, c.value])));
  const socialLinks = (socialRes.data ?? []) as SocialLink[];
  const submissions = (submissionsRes.data ?? []) as ContactSubmission[];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <LogoutButton />
      </div>

      <div className="mt-10 space-y-16">
        <ContentManager initialContent={content} />
        <PhotosManager
          initialPhotos={photos}
          initialSectionPhotos={{
            hero: contentMap[SECTION_PHOTO_KEYS.hero],
            about: contentMap[SECTION_PHOTO_KEYS.about],
            contact: contentMap[SECTION_PHOTO_KEYS.contact],
          }}
        />
        <PricingManager initialPackages={pricingPackages} />
        <SocialLinksManager initialLinks={socialLinks} />
        <ContactSubmissionsList submissions={submissions} />
      </div>
    </main>
  );
}
