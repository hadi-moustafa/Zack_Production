import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import { DESIGN_KEY, isDesign } from "@/lib/design";

// POST /api/design { design: "classic" | "headliner" } — switch the live design.
export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!isDesign(body?.design)) return NextResponse.json({ error: "Unknown design." }, { status: 400 });

  const { error } = await supabase.from("page_content").upsert({ key: DESIGN_KEY, value: body.design }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Every public page wears the design, so refresh them all now rather than
  // waiting for the next scheduled revalidation.
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, design: body.design });
}
