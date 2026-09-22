"use client";

import { useState } from "react";
import type { PageContent } from "@/lib/types";
import { CONTENT_FIELDS, CONTENT_DEFAULTS } from "@/lib/content";
import { Card, SectionHeading, Label, TextInput, TextArea, PrimaryButton, SavedBadge } from "@/components/admin/ui";

const GROUPS = Array.from(new Set(CONTENT_FIELDS.map((f) => f.group)));

export default function ContentManager({ initialContent }: { initialContent: PageContent[] }) {
  const initialValues = { ...CONTENT_DEFAULTS, ...Object.fromEntries(initialContent.map((c) => [c.key, c.value])) };
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const entries = CONTENT_FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
    const res = await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <Card key={group}>
          <SectionHeading title={group} />
          <div className="space-y-4">
            {CONTENT_FIELDS.filter((f) => f.group === group).map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.multiline ? (
                  <TextArea
                    id={field.key}
                    rows={4}
                    value={values[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                ) : (
                  <TextInput
                    id={field.key}
                    type="text"
                    value={values[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save text"}
        </PrimaryButton>
        <SavedBadge show={saved} />
      </div>
    </div>
  );
}
