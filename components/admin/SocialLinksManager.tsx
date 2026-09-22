"use client";

import { useState } from "react";
import type { SocialLink } from "@/lib/types";
import { SOCIAL_LABELS, SOCIAL_PLACEHOLDERS, withSocialDefaults } from "@/lib/social";
import { Card, SectionHeading, Label, TextInput, PrimaryButton, SavedBadge } from "@/components/admin/ui";

export default function SocialLinksManager({ initialLinks }: { initialLinks: SocialLink[] }) {
  const [links, setLinks] = useState<SocialLink[]>(withSocialDefaults(initialLinks));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(platform: string, url: string) {
    setLinks((prev) => prev.map((l) => (l.platform === platform ? { ...l, url } : l)));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/social", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <Card>
      <SectionHeading
        title="Social links"
        description="Shown on the Contact section. Leave a field blank to hide that icon."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <div key={link.platform}>
            <Label>{SOCIAL_LABELS[link.platform] ?? link.platform}</Label>
            <TextInput
              type="url"
              value={link.url}
              onChange={(e) => update(link.platform, e.target.value)}
              placeholder={SOCIAL_PLACEHOLDERS[link.platform] ?? "https://..."}
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save social links"}
        </PrimaryButton>
        <SavedBadge show={saved} />
      </div>
    </Card>
  );
}
