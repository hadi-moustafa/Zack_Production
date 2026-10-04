import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { requireAdmin } from "@/lib/requireAdmin";
import { PHOTOS_BUCKET } from "@/lib/media";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "svg"]);
const MAX_DIMENSION = 900;
const CACHE_FOR_A_YEAR = "31536000";
const KINDS = new Set(["brand", "person"]);
const UUID_RE = /^[0-9a-f-]{36}$/;

type Supabase = NonNullable<Awaited<ReturnType<typeof requireAdmin>>>;

function text(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

/** Only http(s) links, so nothing like javascript: can reach the page. */
function link(value: unknown) {
  const url = text(value, 500);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Resizes a logo or photo (keeping transparency) and stores it. */
async function storeImage(supabase: Supabase, file: File): Promise<{ path: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image is too large (max 15MB)." };
  const buffer = Buffer.from(await file.arrayBuffer());
  let format: string | undefined;
  try {
    format = (await sharp(buffer).metadata()).format;
  } catch {
    return { error: "Unsupported file. Use a PNG, JPEG, WebP or SVG image." };
  }
  if (!format || !ALLOWED_FORMATS.has(format)) return { error: "Unsupported file. Use a PNG, JPEG, WebP or SVG image." };

  const optimized = await sharp(buffer, { density: 300 })
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: format !== "svg" })
    .webp({ quality: 86, alphaQuality: 100 })
    .toBuffer();

  const path = `clients/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, optimized, { contentType: "image/webp", upsert: false, cacheControl: CACHE_FOR_A_YEAR });
  return error ? { error: error.message } : { path };
}

function done(body: unknown) {
  revalidatePath("/");
  return NextResponse.json(body);
}

// POST /api/clients (multipart: name, kind, role?, url?, logo_mono?, file?) — add one
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const name = text(form.get("name"), 80);
  if (!name) return NextResponse.json({ error: "Give them a name." }, { status: 400 });
  const kind = KINDS.has(String(form.get("kind"))) ? String(form.get("kind")) : "brand";
  const url = link(form.get("url"));
  if (url === null) return NextResponse.json({ error: "The link must start with https://" }, { status: 400 });

  let image_path: string | null = null;
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    const stored = await storeImage(supabase, file);
    if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: 400 });
    image_path = stored.path;
  }

  const { data: last } = await supabase
    .from("clients")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      kind,
      role: text(form.get("role"), 80),
      url,
      image_path,
      logo_mono: form.get("logo_mono") !== "false",
      sort_order: (last?.sort_order ?? 0) + 10,
    })
    .select()
    .single();
  if (error) {
    if (image_path) await supabase.storage.from(PHOTOS_BUCKET).remove([image_path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return done({ client: data });
}

// PATCH /api/clients
//   JSON { id, name?, kind?, role?, url?, visible?, logo_mono?, image_path: null } — edit one
//   JSON { reorder: [{ id, sort_order }] }                                         — new order
//   multipart { id, file }                                                         — replace the image
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const update: Record<string, unknown> = {};
  let id: string;

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    const form = await request.formData();
    id = String(form.get("id") ?? "");
    const file = form.get("file");
    if (!UUID_RE.test(id) || !(file instanceof File)) return NextResponse.json({ error: "Missing image." }, { status: 400 });
    const stored = await storeImage(supabase, file);
    if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: 400 });
    update.image_path = stored.path;
  } else {
    const body = await request.json().catch(() => null);
    if (Array.isArray(body?.reorder)) {
      await Promise.all(
        body.reorder
          .filter((r: { id?: unknown; sort_order?: unknown }) => typeof r.id === "string" && typeof r.sort_order === "number")
          .map((r: { id: string; sort_order: number }) => supabase.from("clients").update({ sort_order: r.sort_order }).eq("id", r.id))
      );
      return done({ ok: true });
    }
    id = String(body?.id ?? "");
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Missing id." }, { status: 400 });
    if (typeof body.name === "string" && body.name.trim()) update.name = text(body.name, 80);
    if (KINDS.has(body.kind)) update.kind = body.kind;
    if (typeof body.role === "string") update.role = text(body.role, 80);
    if (typeof body.url === "string") {
      const url = link(body.url);
      if (url === null) return NextResponse.json({ error: "The link must start with https://" }, { status: 400 });
      update.url = url;
    }
    if (typeof body.visible === "boolean") update.visible = body.visible;
    if (typeof body.logo_mono === "boolean") update.logo_mono = body.logo_mono;
    if (body.image_path === null) update.image_path = null;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const { data: before } = "image_path" in update
    ? await supabase.from("clients").select("image_path").eq("id", id).single()
    : { data: null };
  const { data, error } = await supabase.from("clients").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (before?.image_path && before.image_path !== update.image_path) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([before.image_path]);
  }
  return done({ client: data });
}

// DELETE /api/clients?id=<uuid> — remove one and its image
export async function DELETE(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const { data: row } = await supabase.from("clients").select("image_path").eq("id", id).single();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (row?.image_path) await supabase.storage.from(PHOTOS_BUCKET).remove([row.image_path]);
  return done({ ok: true });
}
