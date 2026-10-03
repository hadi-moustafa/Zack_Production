import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { slugify } from "@/lib/categories";

const KINDS = new Set(["photo", "video", "both"]);

type Supabase = NonNullable<Awaited<ReturnType<typeof requireAdmin>>>;

// Slugs must be unique; add -2, -3… when a name clashes after slugifying.
async function uniqueSlug(supabase: Supabase, name: string, exceptId?: string) {
  const base = slugify(name);
  const { data } = await supabase.from("categories").select("id, slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((c) => c.id !== exceptId).map((c) => c.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

// POST /api/categories { name, kind? } — create a category
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 60);
  if (!name) return NextResponse.json({ error: "Give the category a name." }, { status: 400 });
  const kind = KINDS.has(body?.kind) ? body.kind : "both";

  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, kind, slug: await uniqueSlug(supabase, name), sort_order: (last?.sort_order ?? 0) + 10 })
    .select()
    .single();
  if (error) {
    const message = error.code === "23505" ? "A category with that name already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ category: data });
}

// PATCH /api/categories
//   { id, name?, kind?, visible?, cover_path? } — edit one
//   { reorder: [{ id, sort_order }] }           — save a new order
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (Array.isArray(body?.reorder)) {
    await Promise.all(
      body.reorder
        .filter((r: { id?: unknown; sort_order?: unknown }) => typeof r.id === "string" && typeof r.sort_order === "number")
        .map((r: { id: string; sort_order: number }) =>
          supabase.from("categories").update({ sort_order: r.sort_order }).eq("id", r.id)
        )
    );
    return NextResponse.json({ ok: true });
  }

  const id = typeof body?.id === "string" ? body.id : null;
  if (!id) return NextResponse.json({ error: "Missing category id." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    update.name = body.name.trim().slice(0, 60);
    update.slug = await uniqueSlug(supabase, update.name as string, id);
  }
  if (KINDS.has(body.kind)) update.kind = body.kind;
  if (typeof body.visible === "boolean") update.visible = body.visible;
  if (body.cover_path === null || typeof body.cover_path === "string") update.cover_path = body.cover_path;

  const { data, error } = await supabase.from("categories").update(update).eq("id", id).select().single();
  if (error) {
    const message = error.code === "23505" ? "A category with that name already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ category: data });
}

// DELETE /api/categories?id=<uuid> — only when empty, so nothing silently
// drops out of the gallery.
export async function DELETE(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing category id." }, { status: 400 });

  const { count } = await supabase.from("photos").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (count) {
    return NextResponse.json(
      { error: `Move or delete its ${count} item${count === 1 ? "" : "s"} first.` },
      { status: 400 }
    );
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
