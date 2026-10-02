import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { fetchInstagramUsername } from "@/lib/instagram";

// PUT /api/instagram — connect an account with a long-lived access token
// Body: { token: string }
export async function PUT(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const username = await fetchInstagramUsername(token);
  if (!username) {
    return NextResponse.json(
      { error: "Instagram rejected that token. Make sure it's a long-lived Instagram API token." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("instagram_account")
    .upsert({ id: 1, access_token: token, username, refreshed_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, username });
}

// DELETE /api/instagram — disconnect the account
export async function DELETE() {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("instagram_account").delete().eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
