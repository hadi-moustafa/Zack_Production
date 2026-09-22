import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabasePublic";

// GET /api/cron/keep-alive — pinged daily by Vercel Cron (see vercel.json) so
// Supabase sees regular API activity and never auto-pauses the free-tier
// project for inactivity (which otherwise requires a manual restore in the
// Supabase dashboard after ~7 idle days).
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { error } = await supabasePublic.from("page_content").select("key").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
