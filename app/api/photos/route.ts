import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/requireAdmin";
import { PHOTOS_BUCKET } from "@/lib/media";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap (larger files are shrunk in the browser)
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_DIMENSION = 2400; // resize longest edge down to this
// Files are named by UUID and never overwritten, so they can be cached for a year
// (this also lets Supabase serve repeats from its CDN instead of counting egress).
const CACHE_FOR_A_YEAR = "31536000";
const VIDEO_PATH_RE = /^[0-9a-f-]{36}\.(mp4|webm|mov)$/;
// "<video uuid>.poster.jpg", or "<video uuid>.poster-<timestamp>.jpg" once a
// new frame has been picked (a new name, because files are cached for a year).
const POSTER_PATH_RE = /^[0-9a-f-]{36}\.poster(-\d+)?\.(jpg|webp)$/;
const UUID_RE = /^[0-9a-f-]{36}$/;
const BLUR_RE = /^data:image\/(webp|jpeg);base64,[A-Za-z0-9+/=]{1,2000}$/;

type Supabase = NonNullable<Awaited<ReturnType<typeof requireAdmin>>>;

function categoryId(value: unknown): string | null {
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

function dimension(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 20000 ? n : null;
}

/** Tiny blurred stand-in shown while the real image loads (~150 bytes). */
async function blurFrom(input: Buffer) {
  const tiny = await sharp(input).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${tiny.toString("base64")}`;
}

// POST /api/photos
// - multipart/form-data (file, category_id, caption): upload a photo
// - JSON { storage_path, poster_path?, width?, height?, blur_data?, category_id, caption }:
//   register a video the admin's browser uploaded straight to Storage (videos
//   are too big for a serverless function, which caps request bodies at 4.5 MB)
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json().catch(() => null);
    const storagePath = String(body?.storage_path ?? "");
    const posterPath = typeof body?.poster_path === "string" ? body.poster_path : null;
    if (!VIDEO_PATH_RE.test(storagePath) || (posterPath && !POSTER_PATH_RE.test(posterPath))) {
      return NextResponse.json({ error: "Invalid video path." }, { status: 400 });
    }
    return insertRow(supabase, {
      storage_path: storagePath,
      poster_path: posterPath,
      media_type: "video",
      category_id: categoryId(body?.category_id),
      caption: String(body?.caption || "").slice(0, 500),
      width: dimension(body?.width),
      height: dimension(body?.height),
      blur_data: typeof body?.blur_data === "string" && BLUR_RE.test(body.blur_data) ? body.blur_data : null,
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate the file is actually an image by inspecting it, not the extension/MIME header.
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return NextResponse.json({ error: "Unsupported file. Use a JPEG, PNG or WebP photo." }, { status: 400 });
  }
  if (!metadata.format || !ALLOWED_IMAGE_MIME.has(`image/${metadata.format}`)) {
    return NextResponse.json({ error: "Unsupported image type. Use JPEG, PNG, or WebP." }, { status: 400 });
  }

  // Compress and resize before upload to keep the site fast.
  const { data: optimized, info } = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const storagePath = `${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, optimized, { contentType: "image/webp", upsert: false, cacheControl: CACHE_FOR_A_YEAR });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  return insertRow(supabase, {
    storage_path: storagePath,
    poster_path: null,
    media_type: "photo",
    category_id: categoryId(formData.get("category_id")),
    caption: String(formData.get("caption") || "").slice(0, 500),
    width: info.width,
    height: info.height,
    blur_data: await blurFrom(optimized),
  });
}

async function insertRow(
  supabase: Supabase,
  row: {
    storage_path: string;
    poster_path: string | null;
    media_type: "photo" | "video";
    category_id: string | null;
    caption: string;
    width: number | null;
    height: number | null;
    blur_data: string | null;
  }
) {
  // New items go to the end of their kind's list.
  const { data: last } = await supabase
    .from("photos")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("photos")
    .insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 })
    .select()
    .single();

  if (error) {
    await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([row.storage_path, ...(row.poster_path ? [row.poster_path] : [])]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ photo: data });
}

// PATCH /api/photos
//   { id, caption?, category_id?, featured?, poster_path? } — edit one item
//   { ids: [...], category_id? | featured? }                — bulk edit
//   { reorder: [{ id, sort_order }] }                       — save a new order
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  if (Array.isArray(body.reorder)) {
    const rows = body.reorder.filter(
      (r: { id?: unknown; sort_order?: unknown }) => typeof r.id === "string" && typeof r.sort_order === "number"
    ) as { id: string; sort_order: number }[];
    await Promise.all(rows.map((r) => supabase.from("photos").update({ sort_order: r.sort_order }).eq("id", r.id)));
    return NextResponse.json({ ok: true });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.caption === "string") update.caption = body.caption.slice(0, 500);
  if ("category_id" in body) update.category_id = categoryId(body.category_id);
  if (typeof body.featured === "boolean") update.featured = body.featured;
  if (typeof body.poster_path === "string") {
    if (!POSTER_PATH_RE.test(body.poster_path)) {
      return NextResponse.json({ error: "Invalid poster path." }, { status: 400 });
    }
    update.poster_path = body.poster_path;
    const blur = typeof body.blur_data === "string" && BLUR_RE.test(body.blur_data) ? body.blur_data : null;
    if (blur) update.blur_data = blur;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  if (Array.isArray(body.ids)) {
    const ids = body.ids.filter((id: unknown) => typeof id === "string" && UUID_RE.test(id as string));
    if (ids.length === 0) return NextResponse.json({ error: "No items selected." }, { status: 400 });
    const { data, error } = await supabase.from("photos").update(update).in("id", ids).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ photos: data });
  }

  if (typeof body.id !== "string") return NextResponse.json({ error: "Missing photo id." }, { status: 400 });
  const { data: before } = update.poster_path
    ? await supabase.from("photos").select("poster_path").eq("id", body.id).single()
    : { data: null };
  const { data, error } = await supabase.from("photos").update(update).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // A newly picked preview replaces the old file.
  if (before?.poster_path && before.poster_path !== update.poster_path) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([before.poster_path]);
    await supabase.from("categories").update({ cover_path: update.poster_path }).eq("cover_path", before.poster_path);
  }
  return NextResponse.json({ photo: data });
}

// DELETE /api/photos?id=<uuid>[&id=<uuid>…] — remove items and their files
export async function DELETE(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ids = new URL(request.url).searchParams.getAll("id").filter((id) => UUID_RE.test(id));
  if (ids.length === 0) return NextResponse.json({ error: "Missing photo id." }, { status: 400 });

  const { data: rows, error: fetchError } = await supabase.from("photos").select("*").in("id", ids);
  if (fetchError || !rows?.length) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { error: deleteError } = await supabase.from("photos").delete().in("id", ids);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove(rows.flatMap((r) => [r.storage_path, ...(r.poster_path ? [r.poster_path] : [])]));

  // Clear category covers that pointed at a deleted file.
  const paths = rows.map((r) => r.storage_path).concat(rows.map((r) => r.poster_path).filter(Boolean));
  await supabase.from("categories").update({ cover_path: null }).in("cover_path", paths);

  return NextResponse.json({ ok: true, deleted: rows.map((r) => r.id) });
}
