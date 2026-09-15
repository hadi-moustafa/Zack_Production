import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

type PackageInput = {
  id?: string;
  name?: string;
  price?: string;
  features?: string[];
  sort_order?: number;
};

function sanitize(input: PackageInput) {
  return {
    name: String(input.name ?? "").slice(0, 100),
    price: String(input.price ?? "").slice(0, 50),
    features: Array.isArray(input.features)
      ? input.features.map((f) => String(f).slice(0, 200)).slice(0, 30)
      : [],
    sort_order: typeof input.sort_order === "number" ? input.sort_order : 0,
  };
}

// POST /api/pricing — create a package
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as PackageInput | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const { data, error } = await supabase
    .from("pricing_packages")
    .insert(sanitize(body))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ package: data });
}

// PATCH /api/pricing — update a package (body must include id)
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as PackageInput | null;
  if (!body?.id) return NextResponse.json({ error: "Missing package id." }, { status: 400 });

  const { data, error } = await supabase
    .from("pricing_packages")
    .update(sanitize(body))
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ package: data });
}

// DELETE /api/pricing?id=<uuid>
export async function DELETE(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing package id." }, { status: 400 });

  const { error } = await supabase.from("pricing_packages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
