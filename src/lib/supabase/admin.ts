import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Service-role client. Bypasses RLS entirely — server-only (the
 * "server-only" import throws a build error if this is ever pulled into a
 * client bundle). Every admin write (bus arrivals, advertisements) goes
 * through this client from a Server Action guarded by our own admin
 * session cookie, never through a Supabase Auth user.
 */
export function createAdminClient() {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
