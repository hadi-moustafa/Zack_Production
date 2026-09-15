import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

// PATCH /api/social — upsert one or more social links
// Body: { links: { platform: string, url: string }[] }
export async function PATCH(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const links = body?.links;
  if (!Array.isArray(links) || links.length === 0) {
    return NextResponse.json({ error: "Missing links." }, { status: 400 });
  }

  const rows = links
    .filter((l) => typeof l?.platform === "string")
    .map((l) => ({
      platform: String(l.platform).slice(0, 50),
      url: String(l.url ?? "").slice(0, 500),
    }));

  const { error } = await supabase.from("social_links").upsert(rows, { onConflict: "platform" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
