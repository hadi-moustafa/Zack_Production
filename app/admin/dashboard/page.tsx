import { createServerSupabaseClient } from "@/lib/supabaseServer";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminTabs from "@/components/admin/AdminTabs";
import type { Photo, PricingPackage, PageContent, SocialLink, ContactSubmission } from "@/lib/types";
import { withDefaults } from "@/lib/content";

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
    <div className="min-h-full bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Admin</p>
            <h1 className="text-xl font-semibold text-neutral-900">Site dashboard</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <AdminTabs
          photos={photos}
          content={content}
          contentMap={contentMap}
          pricingPackages={pricingPackages}
          socialLinks={socialLinks}
          submissions={submissions}
        />
      </main>
    </div>
  );
}
