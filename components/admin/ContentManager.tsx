"use client";

import { useState } from "react";
import type { PageContent } from "@/lib/types";
import { CONTENT_FIELDS, CONTENT_DEFAULTS } from "@/lib/content";

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
    <section>
      <h2 className="text-lg font-semibold">Page text</h2>
      <div className="mt-4 space-y-8">
        {GROUPS.map((group) => (
          <div key={group}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {group}
            </h3>
            <div className="mt-3 space-y-4">
              {CONTENT_FIELDS.filter((f) => f.group === group).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-neutral-700">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      rows={5}
                      value={values[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 rounded-md bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save text"}
      </button>
      {saved ? <span className="ml-3 text-sm text-green-600">Saved</span> : null}
    </section>
  );
}
