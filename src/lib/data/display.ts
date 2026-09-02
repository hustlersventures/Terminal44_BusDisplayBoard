import type { SupabaseClient } from "@supabase/supabase-js";
import type { BusBayDisplay, Advertisement } from "@/lib/types";
import { ROTATION } from "@/lib/constants";

/**
 * Plain (non Server Action) fetchers used by both the display page's
 * initial server-side render and the client's realtime refetch — they
 * take whichever Supabase client (server or browser) the caller already
 * has, both using the anon key.
 */
export async function fetchDisplayBuses(supabase: SupabaseClient): Promise<BusBayDisplay[]> {
  // Still-active buses, plus anything marked departed within the grace
  // window — so a bus doesn't vanish the instant it's marked departed,
  // it keeps showing (as "Departed") for a little longer first. The
  // client (DisplayBoard) does the actual grace-period expiry, since no
  // further DB write happens at the moment the window runs out.
  const graceWindowStart = new Date(Date.now() - ROTATION.DEPARTED_GRACE_MS).toISOString();
  const { data, error } = await supabase
    .from("bus_bay_display")
    .select("*")
    .or(`is_active.eq.true,and(status.eq.departed,updated_at.gte.${graceWindowStart})`)
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
