import { createPublicClient } from "@/lib/supabase/public";
import { fetchDisplayBuses, fetchDisplayAds } from "@/lib/data/display";
import DisplayBoard from "./DisplayBoard";

// This is a live board — always fetch fresh on load, then stay in sync via Realtime.
export const dynamic = "force-dynamic";

export default async function DisplayPage() {
  const supabase = createPublicClient();
  const [buses, ads] = await Promise.all([fetchDisplayBuses(supabase), fetchDisplayAds(supabase)]);

  return <DisplayBoard initialBuses={buses} initialAds={ads} />;
}
