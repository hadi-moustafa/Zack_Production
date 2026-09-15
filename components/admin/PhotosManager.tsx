"use client";

import { useState } from "react";
import Image from "next/image";
import { photoPublicUrl } from "@/lib/supabaseClient";
import type { Photo } from "@/lib/types";

export default function PhotosManager({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
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
    form.reset();
    setCategory("");
    setCaption("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleEdit(id: string, field: "category" | "caption", value: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
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

  return (
    <section>
      <h2 className="text-lg font-semibold">Photos</h2>

      <form onSubmit={handleUpload} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Photo file</label>
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Weddings"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Caption</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="rounded-md border border-neutral-200 p-3">
            <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
              <Image
                src={photoPublicUrl(photo.storage_path)}
                alt={photo.caption || photo.category}
                fill
                sizes="30vw"
                className="object-cover"
              />
            </div>
            <input
              value={photo.category}
              onChange={(e) => handleEdit(photo.id, "category", e.target.value)}
              onBlur={() => handleEditSave(photo.id)}
              className="mt-2 w-full rounded border border-neutral-200 px-2 py-1 text-sm"
              placeholder="Category"
            />
            <input
              value={photo.caption}
              onChange={(e) => handleEdit(photo.id, "caption", e.target.value)}
              onBlur={() => handleEditSave(photo.id)}
              className="mt-1 w-full rounded border border-neutral-200 px-2 py-1 text-sm"
              placeholder="Caption"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === photos.length - 1}
                  className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <button
                onClick={() => handleDelete(photo.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
