import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

// PATCH /api/content — upsert one or more key/value pairs
// Body: { entries: { key: string, value: string }[] }
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const entries = body?.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "Missing entries." }, { status: 400 });
  }

  const rows = entries
    .filter((e) => typeof e?.key === "string")
    .map((e) => ({
      key: String(e.key).slice(0, 100),
      value: String(e.value ?? "").slice(0, 10000),
    }));

  const { error } = await supabase.from("page_content").upsert(rows, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
