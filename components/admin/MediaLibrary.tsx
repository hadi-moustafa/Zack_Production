"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient, photoPublicUrl, PHOTOS_BUCKET } from "@/lib/supabaseClient";
import {
  blurDataUrl,
  captureVideoFrame,
  sendWithProgress,
  shrinkImageForUpload,
  videoSize,
} from "@/lib/mediaClient";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { byOrder, categoriesFor } from "@/lib/categories";
import type { Category, Photo } from "@/lib/types";
import { Card, SectionHeading, TextInput, SecondaryButton, DangerLink } from "@/components/admin/ui";
import { IconUpload } from "@/components/icons";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // Supabase free plan's per-file limit
const CACHE_FOR_A_YEAR = "31536000"; // files are UUID-named and never overwritten
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";
const SITE_IMAGES = "__site__";
const ALL = "__all__";

// Hero uses the showreel, so only these sections take a picked photo.
const SLOTS = [
  { slot: "about", label: "About photo" },
  { slot: "contact", label: "Contact background" },
] as const;
export type SectionSlot = (typeof SLOTS)[number]["slot"];

type QueueItem = { key: string; name: string; progress: number; status: "waiting" | "uploading" | "done" | "error"; error?: string };

const selectClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-900 focus:border-neutral-900 focus:outline-none";

export default function MediaLibrary({
  kind,
  items: allItems,
  setItems,
  categories,
  sectionPhotos,
  setSectionPhotos,
}: {
  kind: "photo" | "video";
  items: Photo[];
  setItems: React.Dispatch<React.SetStateAction<Photo[]>>;
  categories: Category[];
  sectionPhotos?: Record<SectionSlot, string>;
  setSectionPhotos?: React.Dispatch<React.SetStateAction<Record<SectionSlot, string>>>;
}) {
  const noun = kind === "photo" ? "photo" : "film";
  const usable = useMemo(() => categoriesFor(categories, kind), [categories, kind]);
  const items = useMemo(
    () => allItems.filter((p) => (kind === "video" ? p.media_type === "video" : p.media_type !== "video")).sort(byOrder),
    [allItems, kind]
  );

  const [uploadCategory, setUploadCategory] = useState(usable[0]?.id ?? "");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(ALL);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryName = (id: string | null) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "Unknown") : kind === "photo" ? "Site image" : "No category";

  const shown = items.filter((p) =>
    filter === ALL ? true : filter === SITE_IMAGES ? !p.category_id : p.category_id === filter
  );
  const uploading = queue.some((q) => q.status === "waiting" || q.status === "uploading");

  // ---------- upload ----------

  function patchQueue(key: string, patch: Partial<QueueItem>) {
    setQueue((q) => q.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  async function uploadPhoto(file: File, onProgress: (f: number) => void) {
    const form = new FormData();
    form.append("file", await shrinkImageForUpload(file));
    if (uploadCategory) form.append("category_id", uploadCategory);
    const body = (await sendWithProgress("POST", "/api/photos", form, {}, onProgress)) as { photo: Photo };
    return body.photo;
  }

  // Videos go straight from the browser to Storage (too big for a serverless
  // request), with a still frame as their preview and a blur placeholder.
  async function uploadVideo(file: File, onProgress: (f: number) => void) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("Video is too large (max 50MB).");
    const supabase = createClient();
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) throw new Error("Your login expired — sign in again.");

    const id = crypto.randomUUID();
    const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
    const storagePath = `${id}.${ext}`;
    const posterPath = `${id}.poster.jpg`;
    const [size, poster] = await Promise.all([videoSize(file), captureVideoFrame(file).catch(() => null)]);

    await sendWithProgress(
      "POST",
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${PHOTOS_BUCKET}/${storagePath}`,
      file,
      {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        "Content-Type": file.type,
        "cache-control": `max-age=${CACHE_FOR_A_YEAR}`,
        "x-upsert": "false",
      },
      (f) => onProgress(f * 0.95)
    );

    let posterOk = false;
    if (poster) {
      const { error: posterError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(posterPath, poster, { contentType: "image/jpeg", cacheControl: CACHE_FOR_A_YEAR });
      posterOk = !posterError;
    }

    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storage_path: storagePath,
        poster_path: posterOk ? posterPath : null,
        width: size?.width,
        height: size?.height,
        blur_data: poster ? await blurDataUrl(poster) : null,
        category_id: uploadCategory || null,
        caption: "",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Upload failed.");
    onProgress(1);
    return body.photo as Photo;
  }

  async function addFiles(fileList: FileList | File[]) {
    setError(null);
    const wanted = kind === "photo" ? /^image\/(jpeg|png|webp)$/ : /^video\/(mp4|webm|quicktime)$/;
    const files = Array.from(fileList);
    const skipped = files.filter((f) => !wanted.test(f.type));
    if (skipped.length) {
      setError(
        `${skipped.length} file${skipped.length === 1 ? " was" : "s were"} skipped — ${
          kind === "photo" ? "photos must be JPEG, PNG or WebP (add videos in the Films tab)" : "films must be MP4, WebM or MOV"
        }.`
      );
    }
    const jobs = files
      .filter((f) => wanted.test(f.type))
      .map((file) => ({ file, key: crypto.randomUUID() }));
    if (jobs.length === 0) return;

    setQueue((q) => [
      ...q.filter((i) => i.status !== "done"),
      ...jobs.map(({ file, key }) => ({ key, name: file.name, progress: 0, status: "waiting" as const })),
    ]);

    // One at a time: steadier on phones and slow connections.
    for (const { file, key } of jobs) {
      patchQueue(key, { status: "uploading" });
      try {
        const onProgress = (f: number) => patchQueue(key, { progress: f });
        const photo = kind === "photo" ? await uploadPhoto(file, onProgress) : await uploadVideo(file, onProgress);
        setItems((prev) => [...prev, photo]);
        patchQueue(key, { status: "done", progress: 1 });
      } catch (e) {
        patchQueue(key, { status: "error", error: e instanceof Error ? e.message : "Upload failed." });
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  // ---------- edits ----------

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setError(json.error || "Couldn't save the change.");
    return res.ok ? json : null;
  }

  function updateLocal(ids: string[], change: Partial<Photo>) {
    setItems((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, ...change } : p)));
  }

  async function setCategory(ids: string[], category_id: string | null) {
    updateLocal(ids, { category_id });
    await patch(ids.length === 1 ? { id: ids[0], category_id } : { ids, category_id });
  }

  async function setFeatured(ids: string[], featured: boolean) {
    updateLocal(ids, { featured });
    await patch(ids.length === 1 ? { id: ids[0], featured } : { ids, featured });
  }

  async function remove(ids: string[]) {
    const what = ids.length === 1 ? `this ${noun}` : `these ${ids.length} ${noun}s`;
    if (!confirm(`Delete ${what}? This can't be undone.`)) return;
    const res = await fetch(`/api/photos?${ids.map((id) => `id=${id}`).join("&")}`, { method: "DELETE" });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || "Couldn't delete.");
      return;
    }
    const removedPaths = items.filter((p) => ids.includes(p.id)).map((p) => p.storage_path);
    setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelected(new Set());
    // Clear any section that used a deleted photo.
    if (sectionPhotos && setSectionPhotos) {
      const cleared = SLOTS.filter(({ slot }) => removedPaths.includes(sectionPhotos[slot]));
      if (cleared.length) {
        setSectionPhotos((prev) => {
          const next = { ...prev };
          cleared.forEach(({ slot }) => (next[slot] = ""));
          return next;
        });
        await fetch("/api/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: cleared.map(({ slot }) => ({ key: SECTION_PHOTO_KEYS[slot], value: "" })) }),
        });
      }
    }
  }

  async function assignSlot(slot: SectionSlot, storagePath: string) {
    if (!sectionPhotos || !setSectionPhotos) return;
    const value = sectionPhotos[slot] === storagePath ? "" : storagePath;
    setSectionPhotos((prev) => ({ ...prev, [slot]: value }));
    await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: [{ key: SECTION_PHOTO_KEYS[slot], value }] }),
    });
  }

  // Reorder within this list, reusing its existing sort values so the other
  // kind's order is untouched.
  async function saveOrder(next: Photo[]) {
    const slots = items.map((p) => p.sort_order).sort((a, b) => a - b);
    const reordered = next.map((p, i) => ({ ...p, sort_order: slots[i] ?? i }));
    setItems((prev) => prev.map((p) => reordered.find((r) => r.id === p.id) ?? p));
    await patch({ reorder: reordered.map(({ id, sort_order }) => ({ id, sort_order })) });
  }

  function moveBy(id: string, dir: -1 | 1) {
    const list = [...items];
    const from = list.findIndex((p) => p.id === id);
    // Step past items hidden by the current filter.
    let to = from + dir;
    while (to >= 0 && to < list.length && !shown.some((s) => s.id === list[to].id)) to += dir;
    if (to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    saveOrder(list);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const list = items.filter((p) => p.id !== dragId);
    const dragged = items.find((p) => p.id === dragId)!;
    list.splice(list.findIndex((p) => p.id === targetId), 0, dragged);
    setDragId(null);
    saveOrder(list);
  }

  // ---------- one-time maintenance ----------

  const needsPoster = kind === "video" ? items.filter((p) => !p.poster_path) : [];
  const needsOptimise = kind === "photo" ? items.filter((p) => !p.storage_path.endsWith(".webp")) : [];
  const [maintenance, setMaintenance] = useState<string | null>(null);

  async function createMissingPosters() {
    const storage = createClient().storage.from(PHOTOS_BUCKET);
    for (const [i, video] of needsPoster.entries()) {
      setMaintenance(`Creating previews… ${i + 1} of ${needsPoster.length}`);
      try {
        const blob = await captureVideoFrame(photoPublicUrl(video.storage_path));
        const posterPath = `${video.storage_path.replace(/\.\w+$/, "")}.poster.jpg`;
        const { error: upErr } = await storage.upload(posterPath, blob, {
          contentType: "image/jpeg",
          cacheControl: CACHE_FOR_A_YEAR,
          upsert: true,
        });
        if (upErr) throw new Error(upErr.message);
        const blur = await blurDataUrl(blob);
        if (await patch({ id: video.id, poster_path: posterPath, blur_data: blur })) {
          updateLocal([video.id], { poster_path: posterPath, blur_data: blur });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't create a preview.");
        break;
      }
    }
    setMaintenance(null);
  }

  async function optimisePhotos() {
    for (const [i, photo] of needsOptimise.entries()) {
      setMaintenance(`Optimising… ${i + 1} of ${needsOptimise.length}`);
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
      setItems((prev) => prev.map((p) => (p.id === photo.id ? body.photo : p)));
      setSectionPhotos?.((prev) => {
        const next = { ...prev };
        SLOTS.forEach(({ slot }) => {
          if (next[slot] === photo.storage_path) next[slot] = body.photo.storage_path;
        });
        return next;
      });
    }
    setMaintenance(null);
  }

  // ---------- render ----------

  const selectedIds = Array.from(selected).filter((id) => items.some((p) => p.id === id));
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={kind === "photo" ? "Add photos" : "Add films"}
          description={
            kind === "photo"
              ? "Drop several photos at once. They're resized and compressed automatically, and keep their real shape on the site."
              : "Drop one or more videos (MP4, WebM or MOV, up to 50MB each; under 10MB is ideal). A preview image is made automatically."
          }
        />
        <label className="block text-sm font-medium text-neutral-700" htmlFor={`${kind}-upload-category`}>
          Add to category
        </label>
        <select
          id={`${kind}-upload-category`}
          value={uploadCategory}
          onChange={(e) => setUploadCategory(e.target.value)}
          className={`${selectClass} mt-1.5 sm:max-w-xs`}
        >
          {usable.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="">{kind === "photo" ? "Site image (not in gallery)" : "No category (hidden)"}</option>
        </select>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          className={`mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragOver ? "border-neutral-900 bg-neutral-100" : "border-neutral-300 bg-neutral-50 hover:border-neutral-900"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <IconUpload className="h-5 w-5 text-neutral-700" />
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            Drop {noun}s here or tap to choose
          </span>
          <span className="text-xs text-neutral-500">You can select several at once</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={kind === "photo" ? IMAGE_ACCEPT : VIDEO_ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        {queue.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {queue.map((q) => (
              <li key={q.key} className="rounded-lg border border-neutral-200 px-3 py-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-neutral-800">{q.name}</span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      q.status === "error" ? "text-red-600" : q.status === "done" ? "text-emerald-600" : "text-neutral-500"
                    }`}
                  >
                    {q.status === "done"
                      ? "Added ✓"
                      : q.status === "error"
                        ? "Failed"
                        : q.status === "waiting"
                          ? "Waiting"
                          : `${Math.round(q.progress * 100)}%`}
                  </span>
                </div>
                {q.status === "uploading" || q.status === "waiting" ? (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full bg-neutral-900 transition-[width]" style={{ width: `${q.progress * 100}%` }} />
                  </div>
                ) : null}
                {q.error ? <p className="mt-1 text-xs text-red-600">{q.error}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </Card>

      {needsPoster.length > 0 || needsOptimise.length > 0 ? (
        <Card>
          <SectionHeading
            title={
              needsPoster.length
                ? `${needsPoster.length} film${needsPoster.length === 1 ? "" : "s"} without a preview image`
                : `${needsOptimise.length} photo${needsOptimise.length === 1 ? " is" : "s are"} stored uncompressed`
            }
            description="A one-time fix for items added before this was automatic."
          />
          <SecondaryButton
            disabled={maintenance !== null || uploading}
            onClick={needsPoster.length ? createMissingPosters : optimisePhotos}
          >
            {maintenance ?? (needsPoster.length ? "Create previews" : "Optimise photos")}
          </SecondaryButton>
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">
            {kind === "photo" ? "Photos" : "Films"} ({shown.length}
            {filter === ALL ? "" : ` of ${items.length}`})
          </h2>
          <p className="text-xs text-neutral-500">Drag to reorder · ★ shows first in “All”</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { id: ALL, label: "All" },
            ...usable.map((c) => ({ id: c.id, label: c.name })),
            ...(items.some((p) => !p.category_id)
              ? [{ id: SITE_IMAGES, label: kind === "photo" ? "Site images" : "No category" }]
              : []),
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                filter === f.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 ? (
          <div className="sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-neutral-900 p-2 pl-4 text-sm text-white">
            <span className="mr-auto font-semibold">{selectedIds.length} selected</span>
            <select
              aria-label="Move selected to category"
              value=""
              onChange={(e) => e.target.value && setCategory(selectedIds, e.target.value === "none" ? null : e.target.value)}
              className="rounded-md bg-white/10 px-2 py-1.5 text-white [&>option]:text-neutral-900"
            >
              <option value="">Move to…</option>
              {usable.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="none">{kind === "photo" ? "Site images" : "No category"}</option>
            </select>
            <button type="button" onClick={() => setFeatured(selectedIds, true)} className="rounded-md px-2.5 py-1.5 hover:bg-white/10">
              ★ Star
            </button>
            <button type="button" onClick={() => setFeatured(selectedIds, false)} className="rounded-md px-2.5 py-1.5 hover:bg-white/10">
              ☆ Unstar
            </button>
            <button type="button" onClick={() => remove(selectedIds)} className="rounded-md px-2.5 py-1.5 text-red-300 hover:bg-white/10">
              Delete
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="rounded-md px-2.5 py-1.5 hover:bg-white/10">
              Clear
            </button>
          </div>
        ) : null}

        {shown.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing here yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((item, i) => {
              const thumb = kind === "video" ? item.poster_path : item.storage_path;
              const isSelected = selected.has(item.id);
              return (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropOn(item.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`flex flex-col rounded-lg border bg-white p-2 transition ${
                    isSelected ? "border-neutral-900 ring-2 ring-neutral-900/15" : "border-neutral-200"
                  } ${dragId === item.id ? "opacity-40" : ""}`}
                >
                  <div className="relative aspect-square cursor-grab overflow-hidden rounded-md bg-neutral-100 active:cursor-grabbing">
                    {thumb ? (
                      <Image
                        src={photoPublicUrl(thumb)}
                        alt={item.caption || categoryName(item.category_id)}
                        fill
                        sizes="(min-width: 1024px) 220px, 45vw"
                        placeholder={item.blur_data ? "blur" : "empty"}
                        blurDataURL={item.blur_data ?? undefined}
                        className="object-cover"
                      />
                    ) : (
                      <video src={photoPublicUrl(item.storage_path)} muted preload="metadata" className="h-full w-full object-cover" />
                    )}
                    <label className="absolute left-1.5 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        aria-label={`Select ${noun} ${i + 1}`}
                        className="h-4 w-4 accent-neutral-900"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFeatured([item.id], !item.featured)}
                      aria-label={item.featured ? "Unstar" : "Star (show first)"}
                      aria-pressed={item.featured}
                      className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-md text-lg shadow ${
                        item.featured ? "bg-amber-400 text-white" : "bg-white/90 text-neutral-400 hover:text-amber-500"
                      }`}
                    >
                      ★
                    </button>
                  </div>

                  <select
                    aria-label="Category"
                    value={item.category_id ?? ""}
                    onChange={(e) => setCategory([item.id], e.target.value || null)}
                    className={`${selectClass} mt-2 !py-1.5 text-sm`}
                  >
                    {usable.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    {item.category_id && !usable.some((c) => c.id === item.category_id) ? (
                      <option value={item.category_id}>{categoryName(item.category_id)}</option>
                    ) : null}
                    <option value="">{kind === "photo" ? "Site image" : "No category"}</option>
                  </select>
                  <TextInput
                    aria-label="Caption"
                    placeholder="Caption (optional)"
                    value={item.caption}
                    onChange={(e) => updateLocal([item.id], { caption: e.target.value })}
                    onBlur={(e) => patch({ id: item.id, caption: e.target.value })}
                    className="!mt-2 !py-1.5 text-sm"
                  />

                  {kind === "photo" && sectionPhotos ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {SLOTS.map(({ slot, label }) => {
                        const active = sectionPhotos[slot] === item.storage_path;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => assignSlot(slot, item.storage_path)}
                            aria-pressed={active}
                            className={`rounded-full px-2 py-1 text-[0.7rem] font-semibold transition ${
                              active ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {active ? "✓ " : ""}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveBy(item.id, -1)}
                        aria-label="Move earlier"
                        className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-900"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBy(item.id, 1)}
                        aria-label="Move later"
                        className="h-8 w-8 rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-900"
                      >
                        →
                      </button>
                    </div>
                    <DangerLink onClick={() => remove([item.id])}>Delete</DangerLink>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
