"use client";

import { useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { byOrder } from "@/lib/categories";
import type { Category, CategoryKind, Photo } from "@/lib/types";
import { Card, SectionHeading, Label, TextInput, SecondaryButton, DangerLink } from "@/components/admin/ui";

const KIND_LABEL: Record<CategoryKind, string> = {
  both: "Photos & films",
  photo: "Photos only",
  video: "Films only",
};

const selectClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none";

export default function CategoriesManager({
  categories,
  setCategories,
  items,
}: {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  items: Photo[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; kind: CategoryKind }>({ name: "", kind: "both" });
  const sorted = [...categories].sort(byOrder);

  async function send(method: "POST" | "PATCH" | "DELETE", body?: unknown, query = "") {
    setError(null);
    const res = await fetch(`/api/categories${query}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setError(json.error || "Couldn't save the change.");
    return res.ok ? json : null;
  }

  async function update(id: string, change: Partial<Category>) {
    const before = categories;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...change } : c)));
    const json = await send("PATCH", { id, ...change });
    if (json?.category) setCategories((prev) => prev.map((c) => (c.id === id ? json.category : c)));
    else setCategories(before);
  }

  async function move(index: number, dir: -1 | 1) {
    const a = sorted[index];
    const b = sorted[index + dir];
    if (!a || !b) return;
    const next = [
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ];
    setCategories((prev) => prev.map((c) => ({ ...c, sort_order: next.find((n) => n.id === c.id)?.sort_order ?? c.sort_order })));
    await send("PATCH", { reorder: next });
  }

  async function create() {
    const json = await send("POST", draft);
    if (json?.category) {
      setCategories((prev) => [...prev, json.category]);
      setDraft({ name: "", kind: "both" });
    }
  }

  async function remove(category: Category) {
    if (!confirm(`Delete the “${category.name}” category?`)) return;
    if (await send("DELETE", undefined, `?id=${category.id}`)) {
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title="Categories"
          description="These are the categories visitors browse in Selected Work, in this order. Keep names short (1–3 words) and put the detail in the description. Renaming updates every item instantly; hidden categories disappear from the site without being deleted."
        />
        {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <ul className="space-y-3">
          {sorted.map((category, index) => {
            const inCategory = items.filter((p) => p.category_id === category.id);
            const photos = inCategory.filter((p) => p.media_type !== "video").length;
            const films = inCategory.length - photos;
            const thumbs = inCategory
              .map((p) => (p.media_type === "video" ? p.poster_path : p.storage_path))
              .filter((p): p is string => Boolean(p));
            return (
              <li key={category.id} className={`rounded-lg border p-4 ${category.visible ? "border-neutral-200" : "border-dashed border-neutral-300 bg-neutral-50"}`}>
                <div className="grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
                  <div>
                    <Label htmlFor={`cat-name-${category.id}`}>Name</Label>
                    <TextInput
                      id={`cat-name-${category.id}`}
                      defaultValue={category.name}
                      onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== category.name && update(category.id, { name: e.target.value.trim() })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`cat-kind-${category.id}`}>Shows in</Label>
                    <select
                      id={`cat-kind-${category.id}`}
                      value={category.kind}
                      onChange={(e) => update(category.id, { kind: e.target.value as CategoryKind })}
                      className={`${selectClass} mt-1.5`}
                    >
                      {(Object.keys(KIND_LABEL) as CategoryKind[]).map((k) => (
                        <option key={k} value={k}>
                          {KIND_LABEL[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="h-10 w-10 rounded-lg border border-neutral-300 text-neutral-600 hover:border-neutral-900 disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" aria-label="Move down" disabled={index === sorted.length - 1} onClick={() => move(index, 1)} className="h-10 w-10 rounded-lg border border-neutral-300 text-neutral-600 hover:border-neutral-900 disabled:opacity-30">
                      ↓
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor={`cat-desc-${category.id}`}>Short description (optional, shown under the title)</Label>
                  <TextInput
                    id={`cat-desc-${category.id}`}
                    defaultValue={category.description}
                    maxLength={140}
                    placeholder="e.g. Birthdays, gender reveals, celebrities and more"
                    onBlur={(e) => e.target.value.trim() !== category.description && update(category.id, { description: e.target.value.trim() })}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
                  <span>
                    {photos} photo{photos === 1 ? "" : "s"} · {films} film{films === 1 ? "" : "s"}
                  </span>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={category.visible}
                      onChange={(e) => update(category.id, { visible: e.target.checked })}
                      className="h-4 w-4 accent-neutral-900"
                    />
                    Visible on the site
                  </label>
                  <span className="ml-auto">
                    {inCategory.length === 0 ? (
                      <DangerLink onClick={() => remove(category)}>Delete category</DangerLink>
                    ) : (
                      <span className="text-xs text-neutral-400">Empty it to delete</span>
                    )}
                  </span>
                </div>

                {thumbs.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-neutral-500">Cover image on the site</p>
                    <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => update(category.id, { cover_path: null })}
                        aria-pressed={!category.cover_path}
                        className={`flex h-12 shrink-0 items-center rounded-lg border px-3 text-xs font-semibold ${!category.cover_path ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600"}`}
                      >
                        Auto
                      </button>
                      {thumbs.slice(0, 40).map((path) => (
                        <button
                          key={path}
                          type="button"
                          onClick={() => update(category.id, { cover_path: path })}
                          aria-label="Use as thumbnail"
                          aria-pressed={category.cover_path === path}
                          className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-offset-2 ${category.cover_path === path ? "ring-2 ring-neutral-900" : ""}`}
                        >
                          <Image src={photoPublicUrl(path)} alt="" fill sizes="48px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <SectionHeading title="Add a category" />
        <div className="grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
          <div>
            <Label htmlFor="new-cat-name">Name</Label>
            <TextInput
              id="new-cat-name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Engagements"
            />
          </div>
          <div>
            <Label htmlFor="new-cat-kind">Shows in</Label>
            <select
              id="new-cat-kind"
              value={draft.kind}
              onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as CategoryKind }))}
              className={`${selectClass} mt-1.5`}
            >
              {(Object.keys(KIND_LABEL) as CategoryKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <SecondaryButton disabled={!draft.name.trim()} onClick={create}>
            Add category
          </SecondaryButton>
        </div>
      </Card>
    </div>
  );
}
