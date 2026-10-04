import { cache } from "react";
import { supabasePublic } from "@/lib/supabasePublic";
import type { Client } from "@/lib/types";

// Visible brands and people, in admin order. Cached per request so the page
// and the nav share one query. Any error (e.g. the table not created yet)
// simply means "no clients", and the section stays hidden.
export const getClients = cache(async (): Promise<Client[]> => {
  const { data } = await supabasePublic
    .from("clients")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  return ((data ?? []) as Client[]).filter((c) => c.name.trim());
});
