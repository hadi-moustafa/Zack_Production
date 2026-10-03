import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/requireAdmin";
import { SECTION_PHOTO_KEYS } from "@/lib/content";
import { PHOTOS_BUCKET } from "@/lib/media";

const MAX_DIMENSION = 2400;
const CACHE_FOR_A_YEAR = "31536000";

// POST /api/photos/optimize  { id } — re-encodes one photo that was stored
// without compression (e.g. by the old one-time import) the same way new
// uploads are: max 2400px, WebP. One photo per call keeps each request well
// inside the serverless time limit; the admin page loops over them.
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "Missing photo id." }, { status: 400 });

  const { data: photo } = await supabase.from("photos").select("*").eq("id", id).single();
  if (!photo || photo.media_type === "video") {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }
  if (photo.storage_path.endsWith(".webp")) return NextResponse.json({ photo });

  const storage = supabase.storage.from(PHOTOS_BUCKET);
  const { data: original, error: downloadError } = await storage.download(photo.storage_path);
  if (downloadError || !original) {
    return NextResponse.json({ error: downloadError?.message ?? "Couldn't read the photo." }, { status: 500 });
  }

  const { data: optimized, info } = await sharp(Buffer.from(await original.arrayBuffer()))
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const tiny = await sharp(optimized).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

  const newPath = `${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await storage.upload(newPath, optimized, {
    contentType: "image/webp",
    cacheControl: CACHE_FOR_A_YEAR,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: updated, error: updateError } = await supabase
    .from("photos")
    .update({
      storage_path: newPath,
      width: info.width,
      height: info.height,
      blur_data: `data:image/webp;base64,${tiny.toString("base64")}`,
    })
    .eq("id", id)
    .select()
    .single();
  if (updateError) {
    await storage.remove([newPath]);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Keep any section (hero/about/contact) that used this photo pointing at it.
  await supabase
    .from("page_content")
    .update({ value: newPath })
    .in("key", Object.values(SECTION_PHOTO_KEYS))
    .eq("value", photo.storage_path);

  await storage.remove([photo.storage_path]);

  return NextResponse.json({ photo: updated, savedBytes: original.size - optimized.length });
}
