import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/requireAdmin";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB raw upload cap
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_DIMENSION = 2400; // resize longest edge down to this
// Files are named by UUID and never overwritten, so they can be cached for a year
// (this also lets Supabase serve repeats from its CDN instead of counting egress).
const CACHE_FOR_A_YEAR = "31536000";
const VIDEO_PATH_RE = /^[0-9a-f-]{36}\.(mp4|webm|mov)$/;
const POSTER_PATH_RE = /^[0-9a-f-]{36}\.poster\.(jpg|webp)$/;

// Postgres "undefined column": the poster_path migration hasn't been run yet.
function isMissingColumn(error: { code?: string; message?: string } | null) {
  return !!error && (error.code === "42703" || error.code === "PGRST204" || /poster_path/.test(error.message ?? ""));
}

// POST /api/photos
// - multipart/form-data (file, category, caption): upload a photo (or a small video)
// - JSON { storage_path, poster_path?, category, caption }: register a video the
//   admin's browser uploaded straight to Storage (videos are too big to pass
//   through a serverless function, which caps request bodies at 4.5 MB)
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json().catch(() => null);
    const storagePath = String(body?.storage_path ?? "");
    const posterPath = typeof body?.poster_path === "string" ? body.poster_path : null;
    if (!VIDEO_PATH_RE.test(storagePath) || (posterPath && !POSTER_PATH_RE.test(posterPath))) {
      return NextResponse.json({ error: "Invalid video path." }, { status: 400 });
    }
    return insertRow(supabase, {
      storagePath,
      posterPath,
      category: String(body?.category || "Uncategorized").slice(0, 100),
      caption: String(body?.caption || "").slice(0, 500),
      mediaType: "video",
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = String(formData.get("category") || "Uncategorized").slice(0, 100);
  const caption = String(formData.get("caption") || "").slice(0, 500);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const isVideo = ALLOWED_VIDEO_MIME.has(file.type);

  if (isVideo) {
    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: "Video is too large (max 50MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.type === "video/webm" ? "webm" : "mp4";
    const storagePath = `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(storagePath, buffer, { contentType: file.type, upsert: false, cacheControl: CACHE_FOR_A_YEAR });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    return insertRow(supabase, { storagePath, posterPath: null, category, caption, mediaType: "video" });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate the file is actually an image by inspecting it, not the extension/MIME header.
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return NextResponse.json(
      { error: "Unsupported file. Use JPEG, PNG, WebP for photos, or MP4/WebM/MOV for video." },
      { status: 400 }
    );
  }
  if (!metadata.format || !ALLOWED_IMAGE_MIME.has(`image/${metadata.format}`)) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  // Compress and resize before upload to keep the site fast.
  const optimized = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const storagePath = `${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(storagePath, optimized, { contentType: "image/webp", upsert: false, cacheControl: CACHE_FOR_A_YEAR });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return insertRow(supabase, { storagePath, posterPath: null, category, caption, mediaType: "photo" });
}

async function insertRow(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  {
    storagePath,
    posterPath,
    category,
    caption,
    mediaType,
  }: { storagePath: string; posterPath: string | null; category: string; caption: string; mediaType: "photo" | "video" }
) {
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count } = await supabase.from("photos").select("id", { count: "exact", head: true });

  const row: Record<string, string | number> = {
    storage_path: storagePath,
    category,
    caption,
    sort_order: count ?? 0,
    media_type: mediaType,
  };
  let { data, error: insertError } = await supabase
    .from("photos")
    .insert(posterPath ? { ...row, poster_path: posterPath } : row)
    .select()
    .single();
  // Before the poster migration runs, save the video without its preview.
  if (posterPath && isMissingColumn(insertError)) {
    ({ data, error: insertError } = await supabase.from("photos").insert(row).select().single());
  }

  if (insertError) {
    await supabase.storage.from("photos").remove([storagePath, ...(posterPath ? [posterPath] : [])]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ photo: data });
}

// PATCH /api/photos — update caption/category/sort_order for one or more photos
// Body: { id, category?, caption?, sort_order? } or { reorder: [{ id, sort_order }] }
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (Array.isArray(body.reorder)) {
    for (const item of body.reorder) {
      if (typeof item.id !== "string" || typeof item.sort_order !== "number") continue;
      await supabase
        .from("photos")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);
    }
    return NextResponse.json({ ok: true });
  }

  const { id, category, caption, poster_path } = body;
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Missing photo id." }, { status: 400 });
  }

  const update: Record<string, string> = {};
  if (typeof category === "string") update.category = category.slice(0, 100);
  if (typeof caption === "string") update.caption = caption.slice(0, 500);
  if (typeof poster_path === "string") {
    if (!POSTER_PATH_RE.test(poster_path)) {
      return NextResponse.json({ error: "Invalid poster path." }, { status: 400 });
    }
    update.poster_path = poster_path;
  }

  const { data, error } = await supabase
    .from("photos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const message = isMissingColumn(error)
      ? "Run supabase/video-posters-2026-10.sql in Supabase first to enable video previews."
      : error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ photo: data });
}

// DELETE /api/photos?id=<uuid> — remove a photo and its file
export async function DELETE(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing photo id." }, { status: 400 });
  }

  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await supabase.storage
    .from("photos")
    .remove([photo.storage_path, ...(photo.poster_path ? [photo.poster_path] : [])]);
  const { error: deleteError } = await supabase.from("photos").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
