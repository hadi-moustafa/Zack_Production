"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { STATIC_WORK_ITEMS } from "@/lib/staticWork";
import { PRIMARY_CATEGORY_ORDER, sortCategories } from "@/lib/categories";
import type { Photo } from "@/lib/types";
import { Card, SectionHeading, TextInput, SecondaryButton, DangerLink } from "@/components/admin/ui";
import CategoryPicker from "@/components/admin/CategoryPicker";
import { IconCamera, IconVideo, IconPlay, IconUpload } from "@/components/icons";

type SectionSlot = keyof typeof SECTION_PHOTO_KEYS; // "hero" | "about" | "contact"

const SLOT_LABELS: Record<SectionSlot, string> = {
  hero: "Hero background",
  about: "About photo",
  contact: "Contact background",
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

export default function PhotosManager({
  initialPhotos,
  initialSectionPhotos,
  staticMediaImported,
}: {
  initialPhotos: Photo[];
  initialSectionPhotos: Record<SectionSlot, string>;
  staticMediaImported: boolean;
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [sectionPhotos, setSectionPhotos] = useState(initialSectionPhotos);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState(staticMediaImported);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(PRIMARY_CATEGORY_ORDER);
    STATIC_WORK_ITEMS.forEach((w) => set.add(w.category));
    photos.forEach((p) => set.add(p.category));
    return sortCategories(Array.from(set));
  }, [photos]);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category || "Uncategorized");
    formData.append("caption", caption);

    const res = await fetch("/api/photos", { method: "POST", body: formData });
    const body = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(body.error || "Upload failed.");
      return;
    }

    setPhotos((prev) => [...prev, body.photo]);
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;

    setPhotos((prev) => prev.filter((p) => p.id !== id));
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    const clearedSlots = (Object.keys(sectionPhotos) as SectionSlot[]).filter(
      (slot) => sectionPhotos[slot] === photo.storage_path
    );
    if (clearedSlots.length > 0) {
      setSectionPhotos((prev) => {
        const next = { ...prev };
        clearedSlots.forEach((slot) => (next[slot] = ""));
        return next;
      });
      await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: clearedSlots.map((slot) => ({ key: SECTION_PHOTO_KEYS[slot], value: "" })),
        }),
      });
    }
  }

  function handleEdit(id: string, field: "category" | "caption", value: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  async function updateCategory(id: string, value: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, category: value } : p)));
    await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category: value }),
    });
  }

  async function handleEditSave(id: string) {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category: photo.category, caption: photo.caption }),
    });
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;

    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next);

    await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: next.map((p, i) => ({ id: p.id, sort_order: i })),
      }),
    });
  }

  async function assignSlot(slot: SectionSlot, storagePath: string) {
    const nextValue = sectionPhotos[slot] === storagePath ? "" : storagePath;
    setSectionPhotos((prev) => ({ ...prev, [slot]: nextValue }));
    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: [{ key: SECTION_PHOTO_KEYS[slot], value: nextValue }] }),
    });
  }

  async function importStaticMedia() {
    setImporting(true);
    setImportError(null);
    const res = await fetch("/api/photos/import-static", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setImporting(false);

    if (!res.ok) {
      setImportError(body.error || "Import failed.");
      return;
    }

    setPhotos((prev) => [...prev, ...body.photos]);
    setImported(true);
  }

  return (
    <div className="space-y-6">
      {!imported ? (
        <Card>
          <SectionHeading
            title="Import built-in gallery media"
            description="Brings the Weddings photos and the Food, Promotions, Graduations, and Wedding video reels into your library so you can edit, re-categorize, delete, or reassign them here — one-time action."
          />
          <SecondaryButton onClick={importStaticMedia} disabled={importing}>
            {importing ? "Importing…" : "Import now"}
          </SecondaryButton>
          {importError ? <p className="mt-3 text-sm text-red-600">{importError}</p> : null}
        </Card>
      ) : null}

      <Card>
        <SectionHeading
          title="Add photo or video"
          description="Pick a category (or add a new one), then choose a file to upload it right away."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Category</label>
            <CategoryPicker
              value={category}
              categories={categoryOptions}
              onChange={setCategory}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Caption (optional)</label>
            <TextInput value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="" />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <UploadArea
            icon={IconCamera}
            label="Add Photo"
            hint="JPEG, PNG, or WebP · up to 15MB"
            disabled={uploading}
            onClick={() => photoInputRef.current?.click()}
          />
          <UploadArea
            icon={IconVideo}
            label="Add Video"
            hint="MP4, WebM, or MOV · up to 50MB"
            disabled={uploading}
            onClick={() => videoInputRef.current?.click()}
          />
          <input
            ref={photoInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept={VIDEO_ACCEPT}
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />
        </div>

        {uploading ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            Uploading…
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>

      <Card>
        <SectionHeading
          title={`Gallery items (${photos.length})`}
          description="Use the pills to set a photo as the hero, about, or contact background. Reorder with the arrows."
        />

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">No photos or videos uploaded yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, i) => (
              <div key={photo.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                  {photo.media_type === "video" ? (
                    <>
                      <video
                        src={photoPublicUrl(photo.storage_path)}
                        className="h-full w-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                          <IconPlay className="h-4 w-4 text-neutral-900" />
                        </span>
                      </div>
                      <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                        Video
                      </span>
                    </>
                  ) : (
                    <Image
                      src={photoPublicUrl(photo.storage_path)}
                      alt={photo.caption || photo.category}
                      fill
                      sizes="30vw"
                      className="object-cover"
                    />
                  )}
                </div>

                <CategoryPicker
                  value={photo.category}
                  categories={categoryOptions}
                  onChange={(value) => updateCategory(photo.id, value)}
                  className="mt-2 !py-1.5 text-sm"
                />
                <TextInput
                  value={photo.caption}
                  onChange={(e) => handleEdit(photo.id, "caption", e.target.value)}
                  onBlur={() => handleEditSave(photo.id)}
                  className="mt-1.5 !py-1.5 text-sm"
                  placeholder="Caption"
                />

                {photo.media_type !== "video" ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(Object.keys(SLOT_LABELS) as SectionSlot[]).map((slot) => {
                      const active = sectionPhotos[slot] === photo.storage_path;
                      return (
                        <button
                          key={slot}
                          onClick={() => assignSlot(slot, photo.storage_path)}
                          className={`rounded-full border px-2 py-1 text-[0.7rem] transition ${
                            active
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
                          }`}
                        >
                          {active ? "✓ " : ""}
                          {SLOT_LABELS[slot]}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move earlier"
                      className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === photos.length - 1}
                      aria-label="Move later"
                      className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <DangerLink onClick={() => handleDelete(photo.id)}>Delete</DangerLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function UploadArea({
  icon: Icon,
  label,
  hint,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  hint: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-neutral-900 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="h-5 w-5 text-neutral-700" />
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
        <IconUpload className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-xs text-neutral-500">{hint}</span>
    </button>
  );
}
