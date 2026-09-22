import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/requireAdmin";
import { STATIC_WORK_ITEMS } from "@/lib/staticWork";

const IMPORT_FLAG_KEY = "static_media_imported";

function mimeFor(ext: string) {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}

// POST /api/photos/import-static — one-time move of the built-in
// Weddings/Food/Promotions/Graduations media from /public into Supabase, so
// it becomes fully manageable (edit, delete, re-categorize, assign to a
// section) from the Photos & Videos admin tab like any uploaded item.
export async function POST() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: flagRow } = await supabase
    .from("page_content")
    .select("value")
    .eq("key", IMPORT_FLAG_KEY)
    .maybeSingle();

  if (flagRow?.value === "1") {
    return NextResponse.json({ error: "Built-in media has already been imported." }, { status: 400 });
  }

  const { count } = await supabase.from("photos").select("id", { count: "exact", head: true });
  let sortOrder = count ?? 0;

  const imported = [];
  const skipped: string[] = [];

  for (const item of STATIC_WORK_ITEMS) {
    const relPath = item.src.replace(/^\//, "");
    const absPath = path.join(process.cwd(), "public", relPath);

    let buffer: Buffer;
    try {
      buffer = fs.readFileSync(absPath);
    } catch {
      skipped.push(item.id);
      continue;
    }

    const ext = path.extname(relPath).toLowerCase();
    const storagePath = `${crypto.randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(storagePath, buffer, { contentType: mimeFor(ext), upsert: false });

    if (uploadError) {
      skipped.push(item.id);
      continue;
    }

    const { data, error: insertError } = await supabase
      .from("photos")
      .insert({
        storage_path: storagePath,
        category: item.category,
        caption: item.caption ?? "",
        sort_order: sortOrder++,
        media_type: item.kind,
      })
      .select()
      .single();

    if (insertError || !data) {
      await supabase.storage.from("photos").remove([storagePath]);
      skipped.push(item.id);
      continue;
    }

    imported.push(data);
  }

  await supabase
    .from("page_content")
    .upsert({ key: IMPORT_FLAG_KEY, value: "1" }, { onConflict: "key" });

  return NextResponse.json({ photos: imported, skipped });
}
