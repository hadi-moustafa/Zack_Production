"use client";

import { useState } from "react";
import type { SocialLink } from "@/lib/types";

export default function SocialLinksManager({ initialLinks }: { initialLinks: SocialLink[] }) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
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
    <section>
      <h2 className="text-lg font-semibold">Social links</h2>
      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <div key={link.platform}>
            <label className="block text-sm font-medium capitalize text-neutral-700">
              {link.platform}
            </label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => update(link.platform, e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-md bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save social links"}
      </button>
      {saved ? <span className="ml-3 text-sm text-green-600">Saved</span> : null}
    </section>
  );
}
