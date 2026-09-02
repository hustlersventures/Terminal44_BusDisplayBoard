import type { SupabaseClient } from "@supabase/supabase-js";
import type { BusBayDisplay, Advertisement } from "@/lib/types";

/**
 * Plain (non Server Action) fetchers used by both the display page's
 * initial server-side render and the client's realtime refetch — they
 * take whichever Supabase client (server or browser) the caller already
 * has, both using the anon key.
 */
export async function fetchDisplayBuses(supabase: SupabaseClient): Promise<BusBayDisplay[]> {
  const { data, error } = await supabase
    .from("bus_bay_display")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as BusBayDisplay[];
}

export async function fetchDisplayAds(supabase: SupabaseClient): Promise<Advertisement[]> {
  const { data, error } = await supabase
    .from("bus_advertisements")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data as Advertisement[];
}
