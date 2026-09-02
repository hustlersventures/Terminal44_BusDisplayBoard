import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Anon-key client. Safe to call from Client Components (browser, for the
 * live display's realtime subscription) or Server Components (initial
 * page-load fetch). Only ever does reads permitted by RLS to anon/authenticated —
 * never used for admin writes.
 */
export function createPublicClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
