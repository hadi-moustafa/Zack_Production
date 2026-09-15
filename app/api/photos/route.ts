import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/requireAdmin";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB raw upload cap
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_DIMENSION = 2400; // resize longest edge down to this

// POST /api/photos — upload a new photo (multipart/form-data: file, category, caption)
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = String(formData.get("category") || "Uncategorized").slice(0, 100);
  const caption = String(formData.get("caption") || "").slice(0, 500);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate the file is actually an image by inspecting it, not the extension/MIME header.
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    return NextResponse.json({ error: "File is not a valid image." }, { status: 400 });
  }
  if (!metadata.format || !ALLOWED_MIME.has(`image/${metadata.format}`)) {
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
    .upload(storagePath, optimized, { contentType: "image/webp", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { count } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true });

  const { data, error: insertError } = await supabase
    .from("photos")
    .insert({
      storage_path: storagePath,
      category,
      caption,
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from("photos").remove([storagePath]);
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

  const { id, category, caption } = body;
  if (typeof id !== "string") {
    return NextResponse.json({ error: "Missing photo id." }, { status: 400 });
  }

  const update: Record<string, string> = {};
  if (typeof category === "string") update.category = category.slice(0, 100);
  if (typeof caption === "string") update.caption = caption.slice(0, 500);

  const { data, error } = await supabase
    .from("photos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await supabase.storage.from("photos").remove([photo.storage_path]);
  const { error: deleteError } = await supabase.from("photos").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
