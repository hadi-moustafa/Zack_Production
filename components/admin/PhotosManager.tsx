"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient, photoPublicUrl, PHOTOS_BUCKET } from "@/lib/supabaseClient";
import { captureVideoFrame, shrinkImageForUpload } from "@/lib/mediaClient";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { PRIMARY_CATEGORY_ORDER, sortCategories } from "@/lib/categories";
import type { Photo } from "@/lib/types";
import { Card, SectionHeading, TextInput, DangerLink, SecondaryButton } from "@/components/admin/ui";
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

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // Supabase free plan's per-file limit
const CACHE_FOR_A_YEAR = "31536000"; // files are UUID-named and never overwritten

export default function PhotosManager({
  initialPhotos,
  initialSectionPhotos,
}: {
  initialPhotos: Photo[];
  initialSectionPhotos: Record<SectionSlot, string>;
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [sectionPhotos, setSectionPhotos] = useState(initialSectionPhotos);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("All");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(PRIMARY_CATEGORY_ORDER);
    photos.forEach((p) => set.add(p.category));
    return sortCategories(Array.from(set));
  }, [photos]);

  // Only categories that actually have items — unlike categoryOptions above,
  // which also suggests ones with nothing uploaded yet.
  const filterOptions = useMemo(
    () => ["All", ...sortCategories(Array.from(new Set(photos.map((p) => p.category))))],
    [photos]
  );

  const filteredPhotos = useMemo(
    () => (filterCategory === "All" ? photos : photos.filter((p) => p.category === filterCategory)),
    [photos, filterCategory]
  );

  // Videos go straight from the browser to Storage (they're too big for a
  // serverless request), together with a still frame used as their preview.
  async function uploadVideo(file: File) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("Video is too large (max 50MB).");
    const id = crypto.randomUUID();
    const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
    const storagePath = `${id}.${ext}`;
    const posterPath = `${id}.poster.jpg`;
    const storage = createClient().storage.from(PHOTOS_BUCKET);

    const poster = await captureVideoFrame(file).catch(() => null);
    const { error: videoError } = await storage.upload(storagePath, file, {
      contentType: file.type,
      cacheControl: CACHE_FOR_A_YEAR,
    });
    if (videoError) throw new Error(videoError.message);
    const posterOk = poster
      ? !(await storage.upload(posterPath, poster, { contentType: "image/jpeg", cacheControl: CACHE_FOR_A_YEAR })).error
      : false;

    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storage_path: storagePath,
        poster_path: posterOk ? posterPath : null,
        category: category || "Uncategorized",
        caption,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Upload failed.");
    return body.photo as Photo;
  }

  async function uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append("file", await shrinkImageForUpload(file));
    formData.append("category", category || "Uncategorized");
    formData.append("caption", caption);
    const res = await fetch("/api/photos", { method: "POST", body: formData });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Upload failed.");
    return body.photo as Photo;
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const photo = file.type.startsWith("video/") ? await uploadVideo(file) : await uploadPhoto(file);
      setPhotos((prev) => [...prev, photo]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  // One-time clean-up for photos stored uncompressed by the old importer.
  const photosToOptimize = photos.filter((p) => p.media_type !== "video" && !p.storage_path.endsWith(".webp"));
  const [optimizeProgress, setOptimizeProgress] = useState<string | null>(null);

  async function optimizePhotos() {
    setError(null);
    let saved = 0;
    for (const [i, photo] of photosToOptimize.entries()) {
      setOptimizeProgress(`Optimising… ${i + 1} of ${photosToOptimize.length}`);
      const res = await fetch("/api/photos/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Couldn't optimise a photo.");
        break;
      }
      saved += body.savedBytes ?? 0;
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? body.photo : p)));
      setSectionPhotos((prev) => {
        const next = { ...prev };
        (Object.keys(next) as SectionSlot[]).forEach((slot) => {
          if (next[slot] === photo.storage_path) next[slot] = body.photo.storage_path;
        });
        return next;
      });
    }
    setOptimizeProgress(saved > 0 ? `Done, saved ${(saved / 1e6).toFixed(1)} MB` : null);
  }

  // One-time backfill for videos uploaded before previews existed.
  const videosWithoutPoster = photos.filter((p) => p.media_type === "video" && !p.poster_path);
  const [posterProgress, setPosterProgress] = useState<string | null>(null);

  async function createMissingPosters() {
    setError(null);
    const storage = createClient().storage.from(PHOTOS_BUCKET);
    let done = 0;
    for (const video of videosWithoutPoster) {
      setPosterProgress(`Creating previews… ${done + 1} of ${videosWithoutPoster.length}`);
      try {
        const blob = await captureVideoFrame(photoPublicUrl(video.storage_path));
        const posterPath = `${video.storage_path.replace(/\.\w+$/, "")}.poster.jpg`;
        const { error: upErr } = await storage.upload(posterPath, blob, {
          contentType: "image/jpeg",
          cacheControl: CACHE_FOR_A_YEAR,
          upsert: true,
        });
        if (upErr) throw new Error(upErr.message);
        const res = await fetch("/api/photos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: video.id, poster_path: posterPath }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || "Couldn't save the preview.");
        setPhotos((prev) => prev.map((p) => (p.id === video.id ? { ...p, poster_path: posterPath } : p)));
        done += 1;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't create a preview.");
        break;
      }
    }
    setPosterProgress(null);
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

  async function move(id: string, direction: -1 | 1) {
    // Swap with the nearest neighbor within the current filter, not just the
    // next item in the full list, so reordering while filtered by category
    // actually moves it relative to the items you're looking at.
    const targetPos = filteredPhotos.findIndex((p) => p.id === id) + direction;
    if (targetPos < 0 || targetPos >= filteredPhotos.length) return;
    const otherId = filteredPhotos[targetPos].id;

    const globalA = photos.findIndex((p) => p.id === id);
    const globalB = photos.findIndex((p) => p.id === otherId);
    if (globalA === -1 || globalB === -1) return;

    const next = [...photos];
    [next[globalA], next[globalB]] = [next[globalB], next[globalA]];
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

  return (
    <div className="space-y-6">
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

      {photosToOptimize.length > 0 || optimizeProgress ? (
        <Card>
          <SectionHeading
            title={
              photosToOptimize.length > 0
                ? `${photosToOptimize.length} photo${photosToOptimize.length === 1 ? " is" : "s are"} stored uncompressed`
                : "Photos optimised"
            }
            description="These were added before automatic compression. Optimising shrinks each one (same quality on screen) so the gallery loads faster and uses less of the free storage and bandwidth."
          />
          <SecondaryButton onClick={optimizePhotos} disabled={photosToOptimize.length === 0 || (optimizeProgress?.startsWith("Optimising") ?? false)}>
            {optimizeProgress ?? "Optimise photos"}
          </SecondaryButton>
        </Card>
      ) : null}

      {videosWithoutPoster.length > 0 ? (
        <Card>
          <SectionHeading
            title={`${videosWithoutPoster.length} video${videosWithoutPoster.length === 1 ? "" : "s"} without a preview image`}
            description="Videos now show a still preview in the gallery and only download when a visitor taps play. Create previews for these older videos once (takes a few seconds each)."
          />
          <SecondaryButton onClick={createMissingPosters} disabled={posterProgress !== null}>
            {posterProgress ?? "Create previews"}
          </SecondaryButton>
        </Card>
      ) : null}

      <Card>
        <SectionHeading
          title={`Gallery items (${filteredPhotos.length}${filterCategory === "All" ? "" : ` of ${photos.length}`})`}
          description="Use the pills to set a photo as the hero, about, or contact background. Reorder with the arrows."
        />

        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">No photos or videos uploaded yet.</p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap gap-2">
              {filterOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    filterCategory === cat
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredPhotos.length === 0 ? (
              <p className="text-sm text-neutral-500">Nothing in this category yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPhotos.map((photo, i) => (
                  <div key={photo.id} className="rounded-lg border border-neutral-200 p-3">
                    <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                      {photo.media_type === "video" ? (
                        <>
                          {photo.poster_path ? (
                            <Image
                              src={photoPublicUrl(photo.poster_path)}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 33vw, 50vw"
                              className="object-cover"
                            />
                          ) : (
                            <video
                              src={photoPublicUrl(photo.storage_path)}
                              className="h-full w-full object-cover"
                              muted
                              preload="metadata"
                            />
                          )}
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
                          onClick={() => move(photo.id, -1)}
                          disabled={i === 0}
                          aria-label="Move earlier"
                          className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => move(photo.id, 1)}
                          disabled={i === filteredPhotos.length - 1}
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
          </>
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
