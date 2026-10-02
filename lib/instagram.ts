import { createClient } from "@supabase/supabase-js";

// Pulls the newest video/reel from the connected Instagram account through
// the Instagram API (Instagram Login). The long-lived access token lives in
// the private `instagram_account` table, which only the secret key can read,
// and is refreshed here before its 60-day expiry.

const GRAPH = "https://graph.instagram.com";
const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export type InstagramReel = {
  id: string;
  videoUrl: string;
  posterUrl: string | null;
  permalink: string;
  caption: string;
  timestamp: string;
  username: string;
};

type MediaItem = {
  id: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  username?: string;
};

function secretClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}

async function readAccount() {
  const db = secretClient();
  if (!db) return null;
  const { data } = await db
    .from("instagram_account")
    .select("access_token, refreshed_at")
    .eq("id", 1)
    .maybeSingle();
  return data as { access_token: string; refreshed_at: string } | null;
}

// Swaps the stored token for a fresh 60-day one once it's a week old. Safe to
// call often: it's a no-op until the token is due.
export async function refreshInstagramTokenIfStale(): Promise<void> {
  const db = secretClient();
  const account = await readAccount();
  if (!db || !account) return;
  if (Date.now() - new Date(account.refreshed_at).getTime() < REFRESH_AFTER_MS) return;

  const params = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: account.access_token });
  const res = await fetch(`${GRAPH}/refresh_access_token?${params}`, { cache: "no-store" });
  if (!res.ok) return;
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) return;

  await db
    .from("instagram_account")
    .update({ access_token: json.access_token, refreshed_at: new Date().toISOString() })
    .eq("id", 1);
}

export async function fetchInstagramUsername(token: string): Promise<string | null> {
  const params = new URLSearchParams({ fields: "username", access_token: token });
  const res = await fetch(`${GRAPH}/me?${params}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { username?: string };
  return json.username ?? null;
}

export async function getLatestInstagramReel(): Promise<InstagramReel | null> {
  try {
    const account = await readAccount();
    const token = account?.access_token || process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!token) return null;

    void refreshInstagramTokenIfStale().catch(() => {});

    const params = new URLSearchParams({
      fields: "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,username",
      limit: "25",
      access_token: token,
    });
    // Instagram's video URLs are signed and expire after a while, so keep the
    // cache short rather than holding one link for days.
    const res = await fetch(`${GRAPH}/me/media?${params}`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const json = (await res.json()) as { data?: MediaItem[] };
    const video = json.data?.find((m) => m.media_type === "VIDEO" && m.media_url);
    if (!video?.media_url) return null;

    return {
      id: video.id,
      videoUrl: video.media_url,
      posterUrl: video.thumbnail_url ?? null,
      permalink: video.permalink,
      caption: video.caption ?? "",
      timestamp: video.timestamp,
      username: video.username ?? "",
    };
  } catch {
    return null;
  }
}
